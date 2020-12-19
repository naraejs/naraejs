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
  INaraeCore
} from './type';

const S_ModuleInfo = Symbol('ModuleInfo');

type StartHandler = (core: INaraeCore) => (void | Promise<void>);
type StopHandler = () => (void | Promise<void>);

interface IFields {
  identity?: symbol;
  order: number;
  startHandler?: StartHandler;
  stopHandler?: StopHandler;
}

export class ModuleInfo implements IFields {
  private readonly _values: IFields;

  constructor(values: IFields) {
    this._values = values;
  }

  public get identity(): symbol | undefined {
    return undefined;
  }

  public compareIdentity(identity: symbol): boolean {
    return this._values.identity === identity;
  }

  public get startHandler(): StartHandler | undefined {
    return this._values.startHandler;
  }

  public get stopHandler(): StopHandler | undefined {
    return this._values.stopHandler;
  }

  public get order(): number {
    return this._values.order;
  }
}

export class ModuleBuilder {
  private readonly _object: any;
  private readonly _values: IFields = {
    order: 0
  };

  public constructor(identity: symbol, object: any) {
    this._object = object;
    this._values.identity = identity;
  }

  public order(order: number): this {
    this._values.order = order;
    return this;
  }

  public start(handler: StartHandler): this {
    this._values.startHandler = handler;
    return this;
  }

  public stop(handler: StopHandler): this {
    this._values.stopHandler = handler;
    return this;
  }

  public build(): void {
    const info = new ModuleInfo(this._values);
    Object.defineProperty(
      this._object,
      S_ModuleInfo,
      {
        get: () => info
      });
  }
}

export function makeToModule(identity: symbol, object: any): ModuleBuilder {
  return new ModuleBuilder(identity, object);
}

export function getModuleInfoFrom(object: any): ModuleInfo | undefined {
  return object[S_ModuleInfo];
}
