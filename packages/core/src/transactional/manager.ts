import * as uuid from 'uuid';

import {
  beanFactory
} from '../bean-factory';
import {
  Component, Module
} from '../app-beans';
import { makeToModule } from '../module';

import { LoggerLike, Slf, Slfable } from '../logger';

import {
  transactionNamespace,
  S_SetCurrentTransactionStatus,
  S_AopTransactionBegin,
  S_AopTransactionDone,
  S_TransactionalConnectionProxy
} from './intl';
import { TransactionStatus } from './status';
import {ConnectionManager, ITransactionalConnection, ITransactionData} from '../connection-manager';
import { S_GetConnectionProxy } from '../connection-manager/intl';

const S_TransactionModule = Symbol();

@Module()
class TransactionModule {
  constructor() {
    makeToModule(S_TransactionModule, this)
      .start(() => {
        const cmBeans = beanFactory.getBeansByComponentType(ConnectionManager);
        cmBeans.forEach((cmBean) => {
          cmBean.getObject()[S_GetConnectionProxy] = (connection: ITransactionalConnection) => {
            const currentTxContext = TransactionAspectSupport.currentTransactionStatus() as TransactionContext;
            if (currentTxContext) {
              currentTxContext.root.attachConnection(connection);
              return connection.doBegin()
                .then(() => {
                  if (connection.getTransactionData) {
                    currentTxContext.root.transactionData = connection.getTransactionData();
                  }
                })
                .then(() => connection);
            }
            return connection;
          };
        });
      })
      .build();
  }
}

export class TransactionAspectSupport {
  public static currentTransactionStatus(): TransactionStatus {
    return transactionNamespace.get('status');
  }

  public static [S_SetCurrentTransactionStatus](status: TransactionStatus | undefined): void {
    transactionNamespace.set('status', status);
  }

  public static bind<T>(fn: () => T): () => T {
    return transactionNamespace.bind(fn);
  }
}

function getCurrentTransactionContext(): TransactionContext | undefined {
  return TransactionAspectSupport.currentTransactionStatus() as TransactionContext | undefined;
}

export class TransactionContext implements TransactionStatus {
  private readonly _txid: string;
  private readonly _root: TransactionContext;
  private readonly _parent: TransactionContext | undefined;
  private _subcallCounter: number = 0;
  private _subcall: number = 0;
  private _connections: Map<any, ITransactionalConnection> = new Map();
  public transactionData!: ITransactionData;

  constructor(txid: string, parent: TransactionContext | undefined) {
    this._txid = txid;
    this._parent = parent;
    this._root = parent && parent.root || this;
    this._subcall = this._root._subcallCounter++;
  }

  public get txid(): string {
    return this._txid;
  }

  public get root(): TransactionContext {
    return this._root;
  }

  public get parent(): TransactionContext | undefined {
    return this._parent;
  }

  public get subcall(): number {
    return this._subcall;
  }

  public attachConnection(connection: ITransactionalConnection) {
    this._connections.set(connection.getConnectionId(), connection);
  }

  public get connectionList(): ITransactionalConnection[] {
    const iter = this._connections.entries();
    let item: IteratorResult<[any, ITransactionalConnection]>;
    const list: ITransactionalConnection[] = [];
    while ((item = iter.next()) && !item.done) {
      list.push(item.value[1]);
    }
    return list;
  }
}

export interface TransactionIdGenerator {
  generate(): string;
}

class UuidTxidGenerator implements TransactionIdGenerator {
  generate(): string {
    return uuid.v4();
  }
}

@Component()
@Slf({
  namespace: 'naraejs.core'
})
export class TransactionManager implements Slfable {
  public log!: LoggerLike;

  private _txidGenerator: TransactionIdGenerator = new UuidTxidGenerator();
  private _runningTransactions: Record<string, TransactionContext> = {};

  public [S_TransactionalConnectionProxy](connection: ITransactionalConnection) {

    return connection;
  }

  public [S_AopTransactionBegin]<R>(next: (txStatus: TransactionStatus) => R): R {
    const parentTransactionContext = getCurrentTransactionContext();
    const txid = parentTransactionContext && parentTransactionContext.txid || this._txidGenerator.generate();
    const currentTransactionContext = new TransactionContext(
      txid,
      parentTransactionContext
    );
    if (!parentTransactionContext) {
      this.log.debug(`Transaction Begin: txid=${txid}`);
      this.log.trace(`Transaction Begin: txid=${txid}`, new Error('Transaction Trace'));

      this._runningTransactions[txid] = currentTransactionContext;

      return transactionNamespace.runAndReturn(() => {
        TransactionAspectSupport[S_SetCurrentTransactionStatus](currentTransactionContext);
        return next(currentTransactionContext);
      });
    } else {
      this.log.debug(`Transaction Sub-call Enter: txid=${txid}, subsequence=${currentTransactionContext.subcall}`);
      this.log.trace(`Transaction Sub-call Enter: txid=${txid}, subsequence=${currentTransactionContext.subcall}`, new Error('Transaction Trace'));

      TransactionAspectSupport[S_SetCurrentTransactionStatus](currentTransactionContext);
      return next(currentTransactionContext);
    }
  }

  public [S_AopTransactionDone](txStatus: TransactionStatus, err: any | false): Promise<void> {
    const context = txStatus as TransactionContext;

    return Promise.resolve()
      .then(() => {
        TransactionAspectSupport[S_SetCurrentTransactionStatus](context.parent);

        if (context.parent) {
          this.log.debug(`Transaction Sub-call Leave: txid=${context.txid}, subsequence=${context.subcall}`);
          this.log.trace(`Transaction Sub-call Leave: txid=${context.txid}, subsequence=${context.subcall}`, new Error('Transaction Trace'));
        } else {
          this.log.debug(`Transaction Done: txid=${context.txid}`);
          this.log.trace(`Transaction Done: txid=${context.txid}`, new Error('Transaction Trace'));

          return context.connectionList
            .reduce((prev, cur) => {
              if (err) {
                return cur.doRollback();
              } else {
                return cur.doCommit();
              }
            }, Promise.resolve());
        }
      });
  }
}
