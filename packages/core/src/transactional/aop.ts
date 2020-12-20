import { IInstancedClass } from 'bean.ts';
import {
  beanFactory
} from '../bean-factory';
import {
  TransactionManager
} from './manager';
import {
  S_AopTransactionBegin,
  S_AopTransactionDone
} from './intl';

function isPromise<T>(a: any): a is Promise<T> {
  return 'then' in a;
}

function getTransactionManager(): TransactionManager {
  const managerBean = beanFactory.getBeanByClass(TransactionManager) as IInstancedClass<TransactionManager>;
  return (managerBean && managerBean.getObject()) as TransactionManager;
}

export function Transactional() {
  return <T extends Function>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void => {
    const orignalFunction = descriptor.value as Function;
    descriptor.value = function (this: any, ...args: any[]) {
      const manager = getTransactionManager();
      return manager[S_AopTransactionBegin]((txStatus) => {
        let retval: any;
        try {
          retval = orignalFunction.apply(this, args);
        } catch (err) {
          manager[S_AopTransactionDone](txStatus, err);
          throw err;
        }
        if (isPromise(retval)) {
          return retval
            .then((x) => {
              return manager[S_AopTransactionDone](txStatus, false)
                .then(() => x);
            })
            .catch((err) => {
              return manager[S_AopTransactionDone](txStatus, err)
                .then(() => Promise.reject(err));
            });
        } else {
          manager[S_AopTransactionDone](txStatus, false);
          return retval;
        }
      });
    } as any;
  };
}
