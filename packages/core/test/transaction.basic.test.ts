import chai from 'chai';
const expect = chai.expect;

import { EventEmitter } from 'events';

import {
  beanFactory,
  create,
  Service,
  ConnectionManager,
  Transactional,
  Inject,
  TransactionManager,
  TransactionAspectSupport,
  TransactionStatus,
  IConnectionManagerHandler,
  ITransactionalConnection
} from '../src';

let testDb: string[] = [];
let txFlow: Record<number, string[]> = {};

function txFlowPush(index: number, value: string) {
  let o = txFlow[index];
  if (!o) {
    o = [];
    txFlow[index] = o;
  }
  o.push(value);
}

class TestConnection implements ITransactionalConnection {
  private _txData: string[] | null = null;

  doBegin(): Promise<void> {
    console.log('TestConnection: doBegin');
    this._txData = [];
    return Promise.resolve(undefined);
  }

  doCommit(): Promise<void> {
    console.log('TestConnection: doCommit');
    if (this._txData) {
      testDb = this._txData;
    }
    return Promise.resolve(undefined);
  }

  doRollback(): Promise<void> {
    console.log('TestConnection: doRollback');
    this._txData = null;
    return Promise.resolve(undefined);
  }

  getConnectionId(): any {
    return 1;
  }

  insert(data: string): void {
    if (this._txData) {
      this._txData.push(data);
    } else {
      throw new Error('Transaction not started');
    }
  }
}

@ConnectionManager()
class TestCM implements IConnectionManagerHandler<TestConnection> {
  public essential: boolean = false;
  public name: string = 'test';
  public transactional: boolean = false;

  healthCheck(): Promise<any> {
    return Promise.resolve({});
  }

  getConnection(): Promise<TestConnection> {
    return Promise.resolve(new TestConnection());
  }
}

@Service()
class TestService {
  private _transactionManager: TransactionManager;
  private _testCM: TestCM;

  constructor(
    @Inject(TransactionManager)
    transactionManager: TransactionManager,
    @Inject(TestCM)
    testCM: TestCM
  ) {
    this._transactionManager = transactionManager;
    this._testCM = testCM;
  }

  @Transactional()
  public methodA(ee: EventEmitter, a: number): Promise<void> {
    const txStatus = TransactionAspectSupport.currentTransactionStatus() as TransactionStatus;
    console.log(`methodA: ENTER: a=${a} TXID=${txStatus && txStatus.txid}`);
    txFlowPush(a, txStatus.txid);
    return new Promise<void>((resolve, reject) => {
      ee.on('hello', () => {
        this.methodB(a)
          .then(() => resolve())
          .catch((err) => reject(err));
      });
    });
  }

  @Transactional()
  public methodB(a: number): Promise<void> {
    const txStatus = TransactionAspectSupport.currentTransactionStatus() as TransactionStatus;
    console.log(`methodB: ENTER: a=${a} TXID=${txStatus && txStatus.txid}`);
    txFlowPush(a, txStatus.txid);
    return Promise.resolve();
  }

  @Transactional()
  public methodC(ee: EventEmitter, a: number): Promise<void> {
    const txStatus = TransactionAspectSupport.currentTransactionStatus() as TransactionStatus;
    console.log(`methodA: ENTER: a=${a} TXID=${txStatus && txStatus.txid}`);
    txFlowPush(a, txStatus.txid);
    return new Promise<void>((resolve, reject) => {
      ee.on('hello', TransactionAspectSupport.bind((): void => {
        this.methodB(a)
          .then(() => resolve())
          .catch((err) => reject(err));
      }));
    });
  }

  @Transactional()
  public insertDataSuccessfully() {
    return this._testCM.getConnection()
      .then((connection) => {
        connection.insert('FIRST');
        connection.insert('SECOND');
      });
  }

  @Transactional()
  public insertDataFailure() {
    return this._testCM.getConnection()
      .then((connection) => {
        connection.insert('FIRST');
        connection.insert('SECOND');
        return Promise.reject(new Error('Fake Error'));
      });
  }
}

const app = create();

describe('Transactional Test', () => {
  before(() => app.start());
  after(() => app.stop());
  beforeEach(() => {
    testDb = [];
    txFlow = {};
  });

  it('should be commit', () => {
    const a = beanFactory.getBeanObjectByClass(TestService) as TestService;
    return a.insertDataSuccessfully()
      .then(() => {
        expect(testDb).eql(['FIRST', 'SECOND']);
      });
  });

  it('should be rollback', () => {
    const a = beanFactory.getBeanObjectByClass(TestService) as TestService;
    return a.insertDataFailure()
      .catch((err) => {
        console.log('Caught Error: ', err);
      })
      .then(() => {
        expect(testDb).eql([]);
      });
  });

  it('non traced callback should be a failure', () => {
    const events: EventEmitter[] = [
      new EventEmitter(),
      new EventEmitter(),
      new EventEmitter(),
      new EventEmitter()
    ];
    const a = beanFactory.getBeanObjectByClass(TestService) as TestService;
    const p = a.methodA(events[0], 1);
    events.forEach(e => e.emit('hello'));
    return p
      .then(() => {
        expect(txFlow[1][0]).not.eq(txFlow[1][1]);
      });
  });

  it('non traced but bound callback should be successful', () => {
    const events: EventEmitter[] = [
      new EventEmitter(),
      new EventEmitter(),
      new EventEmitter(),
      new EventEmitter()
    ];
    const a = beanFactory.getBeanObjectByClass(TestService) as TestService;
    const p = Promise.all([
      a.methodC(events[0], 1),
      a.methodC(events[1], 2)
    ]);
    events.forEach(e => e.emit('hello'));
    return p
      .then(() => {
        expect(txFlow[1][0]).eq(txFlow[1][1]);
        expect(txFlow[2][0]).eq(txFlow[2][1]);
      });
  });
});
