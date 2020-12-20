import {
  beanFactory
} from './bean-factory';
import {
  Module,
  Configuration
} from './app-beans';
import {
  ConnectionManager
} from './connection-manager';
import {
  IInstancedClass
} from 'bean.ts';
import {
  INaraeCore
} from './type';
import {
  IConnectionManagerHandler,
  IHealthCheckResponse
} from './connection-manager';
import {
  IConfigurationInfo,
  _framework as frameworkConfiguration
} from './configuration';
import {
  getModuleInfoFrom,
  ModuleInfo
} from './module';

const WaitSignal = require('wait-signal');

export namespace framework {
  export function sortComponentByOrder<T extends {options: {order: number}}>(list: T[]): T[] {
    return list.sort((x, y) => {
      const xOrder = x.options && x.options.order || 0;
      const yOrder = y.options && y.options.order || 0;
      if (xOrder < yOrder) {
        return -1;
      } else if (xOrder > yOrder) {
        return 1;
      }
      return 0;
    });
  }

  export interface IFoundConfiguration {
    inst: IInstancedClass<any>;
    options: any;
    info: IConfigurationInfo;
  }

  export function findConfigurationsByIdentity(identity: symbol): IFoundConfiguration[] {
    return sortComponentByOrder(beanFactory.getBeansByComponentType(Configuration)
      .map(v => {
        const attr: any = v.getAnnotation(Configuration);
        return {
          inst: v,
          options: attr.options,
          info: frameworkConfiguration.getConfigurationInfoFrom(v.getObject())
        } as IFoundConfiguration;
      })
      .filter(v => v.info && v.info.compareIdentity(identity)));
  }

  export const makeToConfigurationImpl = frameworkConfiguration.makeToConfigurationImpl;
}

export class Narae implements INaraeCore {
  //@ts-ignore
  private readonly _readySignal = new WaitSignal<void>();

  private _modules!: {
    inst: IInstancedClass<any>,
    info: ModuleInfo
  }[];

  private _cms!: IInstancedClass<any>[];

  public start(): Promise<void> {
    return beanFactory.start()
      .then(() => {
        this._modules = framework.sortComponentByOrder(beanFactory.getBeansByComponentType(Module)
          .filter(v => getModuleInfoFrom(v.getObject()))
          .map(v => {
            const attr: any = v.getAnnotation(Module);
            return {
              inst: v,
              options: attr.options,
              info: (v.getObject() && getModuleInfoFrom(v.getObject())) as ModuleInfo
            };
          }));
        return this._modules.reduce(
          (prev, cur) =>
            prev.then(() => {
              if (cur.info.startHandler) {
                return cur.info.startHandler(this);
              }
            }),
          Promise.resolve()
        );
      })
      .then(() => {
        this._cms = beanFactory.getBeansByComponentType(ConnectionManager);
        this._readySignal.signal();
      })
      .catch((err) => {
        this._readySignal.throw(err);
        return Promise.reject(err);
      });
  }

  public stop(): Promise<void> {
    return Promise.resolve()
      .then(() => this._modules.reverse().reduce(
        (prev, cur) =>
          prev.then(() => {
            if (cur.info.stopHandler) {
              return cur.info.stopHandler();
            }
          }),
        Promise.resolve()
      ))
      .then(() => {});
  }

  public readySignal(): Promise<void> {
    return this._readySignal.wait();
  }

  public healthCheck(): Promise<IHealthCheckResponse> {
    return this._cms.reduce((prev, cur) => {
      return prev.then((response) => {
        const healthChecker = cur.getObject() as IConnectionManagerHandler;
        if (healthChecker && healthChecker.name && healthChecker.healthCheck) {
          const essential = (typeof healthChecker.essential === 'undefined') ? true : healthChecker.essential;
          return healthChecker.healthCheck()
            .then((details) => {
              (response.details as any)[healthChecker.name] = {
                status: 'UP',
                details: details
              } as IHealthCheckResponse;
              return response;
            })
            .catch((err) => {
              if (essential) {
                response.status = 'DOWN';
              }
              (response.details as any)[healthChecker.name] = {
                status: 'DOWN',
                details: err.details || undefined
              };
              return response;
            });
        }
        return response;
      });
    }, Promise.resolve({
      status: 'UP',
      details: {}
    } as IHealthCheckResponse));
  }
}

export function create(): Narae {
  return new Narae();
}
