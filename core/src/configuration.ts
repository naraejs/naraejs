/**
 * narae.js core
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

const S_ConfigurationInfo = Symbol('ConfigurationInfo');

export interface IConfigurationInfo {
  compareIdentity(identity: symbol): boolean;
}

class ConfigurationInfoImpl implements IConfigurationInfo {
  private readonly _identity: symbol;

  constructor(identity: symbol) {
    this._identity = identity;
  }

  public compareIdentity(identity: symbol): boolean {
    return this._identity === identity;
  }
}

export namespace _framework {
  export function getConfigurationInfoFrom(object: any): IConfigurationInfo | undefined {
    return object[S_ConfigurationInfo];
  }

  export function makeToConfigurationImpl(identity: symbol, target: any) {
    const info = new ConfigurationInfoImpl(identity);
    Object.defineProperty(
      target,
      S_ConfigurationInfo,
      {
        get: () => info
      });
  }
}
