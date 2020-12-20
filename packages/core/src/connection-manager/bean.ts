import { BeanType, IBeanOptions } from 'bean.ts';
import { beanFactory } from '../bean-factory';
import { ITransactionalConnection } from './model';
import { S_GetConnectionProxy } from './intl';

export const CONST_ConnectionManager = 'ConnectionManager';
export function ConnectionManager(options?: IBeanOptions) {
  const beanDecorator = beanFactory.makeRegisterAnnotation({
    componentType: CONST_ConnectionManager,
    beanType: BeanType.Singletone,
    beanName: options && options.name
  });
  return <TConstructor extends { new(...args: any[]): {} }>(constructor: TConstructor): TConstructor | void => {
    const orignalGetConnection: (...args: any[]) => Promise<ITransactionalConnection> = constructor.prototype.getConnection as any;
    if (orignalGetConnection) {
      Object.defineProperty(constructor.prototype, 'getConnection', {
        value: function (...args: any[]) {
          return orignalGetConnection(args)
            .then((connection) => {
              if (this[S_GetConnectionProxy]) {
                return this[S_GetConnectionProxy](connection);
              }
              return connection;
            });
        }
      });
    }
    return beanDecorator(constructor);
  };
}

