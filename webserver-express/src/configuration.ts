/**
 * narae.js express module
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

import {
  IConfigurationInfo,
  Partial,
  framework
} from '@naraejs/core';

import {
  S_WebserverConfiguration
} from './intl';

import {
  RequestErrorHandler,
  IHttpMessageConverter
} from './types';

import * as http from 'http';
import * as express from 'express';

export type ServerSupplier = (app: express.Express) => (http.Server | null | Promise<http.Server> | Promise<http.Server | null> | Promise<null>);

export namespace intl {
  export interface IConfigurationValues {
    requestErrorHandler: RequestErrorHandler;
    healthEndpointEnabled: boolean;
    healthEndpointContextPath: string;
    httpPort: number;
    contextPath: string;
    listenEnabled: boolean;
    customServer: ServerSupplier;
  }

  export type IConfigurationOptions = Partial<IConfigurationValues>;
}

export class WebserverExpressConfigurationInfo implements IConfigurationInfo, intl.IConfigurationOptions {
  private readonly _identity: symbol;
  private readonly _order: number;
  private readonly _values: intl.IConfigurationOptions;

  constructor(
    identity: symbol,
    order: number,
    values: intl.IConfigurationOptions
  ) {
    this._identity = identity;
    this._order = order;
    this._values = values;
  }

  public get order(): number {
    return this._order;
  }

  public get requestErrorHandler(): RequestErrorHandler | undefined {
    return this._values.requestErrorHandler;
  }

  compareIdentity(identity: symbol): boolean {
    return identity === this._identity;
  }

  public get healthEndpointContextPath(): string | undefined {
    return this._values.healthEndpointContextPath;
  }

  public get healthEndpointEnabled(): boolean | undefined {
    return this._values.healthEndpointEnabled;
  }

  public get httpPort(): number | undefined {
    return this._values.httpPort;
  }

  public get contextPath(): string | undefined {
    return this._values.contextPath;
  }

  public get listenEnabled(): boolean | undefined {
    return this._values.listenEnabled;
  }

  public get customServer(): ServerSupplier | undefined {
    return this._values.customServer;
  }
}

export class WebserverExpressConfigurationBuilder {
  private _values: intl.IConfigurationOptions = {};

  constructor() {
  }

  public requestErrorHandler(handler: RequestErrorHandler): this {
    this._values.requestErrorHandler = handler;
    return this;
  }

  public healthEndpointEnable(value?: boolean): this {
    if (typeof value === 'undefined') {
      this._values.healthEndpointEnabled = true;
    } else {
      this._values.healthEndpointEnabled = value;
    }
    return this;
  }

  public healthEndpointContextPath(contextPath: string): this {
    this._values.healthEndpointContextPath = contextPath;
    return this;
  }

  public listenEnable(enable?: boolean): this {
    if (typeof enable === 'undefined')
      this._values.listenEnabled = true;
    else
      this._values.listenEnabled = enable;
    return this;
  }

  public httpPort(port: number): this {
    this._values.httpPort = port;
    return this;
  }

  public contextPath(contextPath: string): this {
    this._values.contextPath = contextPath;
    return this;
  }

  public customServer(supplier: ServerSupplier): this {
    this._values.customServer = supplier;
    return this;
  }

  public build() {
    return this._values;
  }
}

export interface IWebserverExpressConfigurer {
  configure?(builder: WebserverExpressConfigurationBuilder): void | Promise<void>;
  configureMessageConverters?(messageConverters: IHttpMessageConverter[]): void | Promise<void>;
}

export function makeToConfiguration(object: IWebserverExpressConfigurer) {
  framework.makeToConfigurationImpl(S_WebserverConfiguration, object);
}
