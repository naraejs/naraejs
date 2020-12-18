import { LoggerLike } from './abstract';
import { RootLogger } from './root-logger';
import { LogBridge } from './log-bridge';

export type ConstructorType<T> = (new (...args: any) => T);

export interface ILoggerFactory {
  getLogger(name: string): LoggerLike;
  getLogger<T>(clazz: ConstructorType<T>): LoggerLike;
  getLogger<T>(name: string | ConstructorType<T>): LoggerLike;
}

const S_ROOT_LOGGER = Symbol();
export class LoggerFactory implements ILoggerFactory {
  private [S_ROOT_LOGGER]: LoggerLike;

  constructor() {
    const writer = LogBridge.getInstance();
    this[S_ROOT_LOGGER] = new RootLogger(writer);
  }

  getLogger(name: string): LoggerLike;
  getLogger<T>(clazz: ConstructorType<T>): LoggerLike;
  getLogger<T>(name: string | ConstructorType<T>): LoggerLike {
    return this[S_ROOT_LOGGER].child((typeof name === 'string') ? name : name.name);
  }

  static getLogger(name: string): LoggerLike;
  static getLogger<T>(clazz: ConstructorType<T>): LoggerLike;
  static getLogger<T>(name: string | ConstructorType<T>): LoggerLike {
    return defaultLoggerFactory.getLogger(name);
  }
}

let defaultLoggerFactory: ILoggerFactory = new LoggerFactory();
export function setLoggerFactory(loggerFactory: ILoggerFactory) {
  defaultLoggerFactory = loggerFactory;
}
