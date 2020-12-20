/**
 * narae.js core
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

import {
  BeanType,
  IBeanOptions
} from 'bean.ts';

import {
  beanFactory
} from '../bean-factory';

import {
  LoggerLike, LogWriter
} from './abstract';

import { LoggerFactory } from './factory';

export const CONST_Slf = 'Slf';
export interface ISlfOptions extends IBeanOptions {
  namespace: string;
}

/**
 * MUST BE ANNOTATE LAST.
 *
 * @param options
 */
export function Slf(options?: ISlfOptions) {
  const beanDecorator = beanFactory.makeRegisterAnnotation({
    componentType: CONST_Slf,
    beanType: BeanType.Annotated,
    beanName: options && options.name,
    options: options
  });
  return <TConstructor extends { new(...args: any[]): {} }>(constructor: TConstructor): TConstructor => {
    const namespace = options && options.namespace && `${options.namespace}.${constructor.name}` || constructor.name;
    const newConstructor = function (...args: any[]) {
      const instance: any = new constructor(...args);
      instance.log = LoggerFactory.getLogger(namespace);
      return instance;
    };
    Object.defineProperty(newConstructor, 'name', {
      value: constructor.name,
      configurable: true,
    });
    newConstructor.prototype = constructor.prototype;
    beanDecorator(newConstructor);
    return newConstructor as any;
  };
}

export interface Slfable {
  readonly log: LoggerLike;
}
