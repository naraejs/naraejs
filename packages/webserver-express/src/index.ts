/**
 * narae.js express module
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

import * as beants from 'bean.ts';
import * as http from 'http';
import express from 'express';
import {
  installer,
  Module,
  Configuration,
  beanFactory,
  CONST_HttpNextParam,
  CONST_HttpRequestParam,
  CONST_HttpResponseParam,
  CONST_RequestBody,
  INaraeCore,
  IRequestMappingOptions,
  RequestMapping,
  makeToModule,
  framework
} from '@naraejs/core';

import {
  IControllerOptions,
  RestController
} from './bean-type';

import {
  IHttpMessageConverter,
  RequestErrorHandler
} from './types';
import {
  S_WebserverExpressModule,
  S_WebserverConfiguration
} from './intl';
import {
  joinUrl
} from './utils';
import {
  intl as confIntl,
  IWebserverExpressConfigurer,
  WebserverExpressConfigurationBuilder,
  makeToConfiguration as makeToWebserverConfiguration,
  ConfigurableExpress
} from './configuration';

import {
  JsonHttpMessageConverter
} from './message_converter/json_http_message_converter';

export * from './bean-type';
export * from './configuration';

const symWrappedRequestRun = Symbol();
const symExpressMessageConverterHandler = Symbol();
const symCurrentSettings = Symbol();

@Module()
export class WebserverExpress {
  private _core!: INaraeCore;

  private _expressApp: express.Express;
  private _expressRouter: express.Router;
  private _expressHealthRouter: express.Router;

  private _requestErrorHandlers: RequestErrorHandler[];

  private _httpMessageConverters: IHttpMessageConverter[];

  private _currentSettings: confIntl.IConfigurationValues = {} as any;

  public get [symCurrentSettings]() {
    return this._currentSettings;
  }

  constructor() {
    this._requestErrorHandlers = [];

    this._expressApp = express();
    this._expressRouter = express.Router();
    this._expressHealthRouter = express.Router();

    this._httpMessageConverters = [];

    const configurableExpress: ConfigurableExpress = {
      getExpress: (): express.Express => {
        return this._expressApp;
      },
      getRouter: (): express.Router => {
        return this._expressRouter;
      }
    };

    makeToModule(S_WebserverExpressModule, this)
      .order(0)
      .start((core: INaraeCore) => {
        this._core = core;

        const lastSettings = this._currentSettings;
        const configurations = framework.findConfigurationsByIdentity(S_WebserverConfiguration);

        return configurations
          .reduce((prev, cur) =>
            prev
              .then(() => {
                const configurerImpl: IWebserverExpressConfigurer = cur.inst.getObject();

                return Promise.resolve()
                  .then(() => {
                    if (configurerImpl.configure) {
                      const builder = new WebserverExpressConfigurationBuilder();
                      return Promise.resolve(configurerImpl.configure(builder))
                        .then(() => {
                          const config = builder.build();
                          if (config.requestErrorHandler) {
                            this._requestErrorHandlers.push(config.requestErrorHandler);
                          }
                          if (typeof config.healthEndpointEnabled !== 'undefined')  {
                            lastSettings.healthEndpointEnabled = config.healthEndpointEnabled;
                            if (config.healthEndpointEnabled && config.healthEndpointContextPath) {
                              lastSettings.healthEndpointContextPath = config.healthEndpointContextPath;
                            }
                          }
                          if (typeof config.listenEnabled !== 'undefined') {
                            lastSettings.listenEnabled = config.listenEnabled;
                          }
                          if (typeof config.httpPort !== 'undefined') {
                            lastSettings.httpPort = config.httpPort;
                          }
                          if (typeof config.contextPath !== 'undefined') {
                            lastSettings.contextPath = config.contextPath;
                          }
                          if (typeof config.customServer !== 'undefined') {
                            lastSettings.customServer = config.customServer;
                          }
                        });
                    }
                  })
                  .then(() => {
                    if (configurerImpl.configureMessageConverters) {
                      return configurerImpl.configureMessageConverters(this._httpMessageConverters);
                    }
                  })
                  .then(() => {
                    if (configurerImpl.expressCustomize) {
                      return configurerImpl.expressCustomize(configurableExpress);
                    }
                  });
              })
          , Promise.resolve())
          .then(() => {
            // Default Values
            if (typeof lastSettings.healthEndpointEnabled === 'undefined') {
              lastSettings.healthEndpointEnabled = true;
              lastSettings.healthEndpointContextPath = '/_/';
            }
            if (typeof lastSettings.listenEnabled === 'undefined') {
              lastSettings.listenEnabled = true;
            }
            if (!lastSettings.httpPort) {
              lastSettings.httpPort = 8080;
            }
            if (!lastSettings.customServer) {
              lastSettings.customServer = (app) => http.createServer(app);
            }

            if (lastSettings.healthEndpointEnabled) {
              this._initHealthEndpoint(this._expressHealthRouter);
              this._expressRouter.use(lastSettings.healthEndpointContextPath, this._expressHealthRouter);
            }

            return Promise.resolve((lastSettings.customServer)(this._expressApp))
              .then((server) => {
                if (server) {
                  if (lastSettings.listenEnabled) {
                    server.listen(lastSettings.httpPort);
                  }
                }
              });
          });
      })
      .stop(() => {
        console.log('web stop');
      })
      .build();
  }

  public get expressApp(): express.Express {
    return this._expressApp;
  }

  public get expressRouter(): express.Router {
    return this._expressRouter;
  }

  public get expressHealthRouter(): express.Router {
    return this._expressHealthRouter;
  }

  private _initHealthEndpoint(router: express.Router) {
    router.get('/health', (req, res, next) => {
      this[symWrappedRequestRun](req, res, next, () => {
        this._core.healthCheck()
          .then((results) => {
            res
              .status(results.status === 'UP' ? 200 : 500)
              .send(results);
          });
      }, {
        ignoreResolvedPromise: true
      });
    });
  }

  private requestErrorHandler(req: express.Request, res: express.Response, next: express.NextFunction, e: Error | any) {
    this._requestErrorHandlers.reduce(
      (prev, cur) =>
        prev
          .then((handled) => {
            if (!handled) {
              return cur(req, res, next, e);
            } else {
              return handled;
            }
          })
      , Promise.resolve(false)
    )
      .then((handled) => {
        if (!handled) {
          res
            .status(500)
            .send({
              message: 'Internal Server Error'
            });
        }
      })
      .catch((err) => {
        console.error('Unhandled error', err);
        res
          .status(500)
          .send({
            message: 'Internal Server Error'
          });
      });
  }

  public [symWrappedRequestRun](req: express.Request, res: express.Response, next: express.NextFunction, runner: () => any, opts?: {
    ignoreResolvedPromise: boolean
  }) {
    const _ignoreResolvedPromise = opts && opts.ignoreResolvedPromise;
    try {
      const returned = runner();
      if (returned) {
        Promise.resolve(returned)
          .then((response) => {
            if (_ignoreResolvedPromise || res.headersSent) {
              return;
            }
            if (response) {
              res
                .status(200)
                .send(response);
            } else {
              res
                .status(204)
                .send(response);
            }
          })
          .catch((e) => {
            this.requestErrorHandler(req, res, next, e);
          });
      }
    } catch (e) {
      this.requestErrorHandler(req, res, next, e);
    }
  }

  private [symExpressMessageConverterHandler](outbound: boolean, req: express.Request, res: express.Response, next: any, data?: any) {
    this._httpMessageConverters.reduce(
      (prev, cur) => prev.then((prevResult) => {
        if (prevResult.processed)
          return prevResult;
        return Promise.resolve()
          .then(() => {
            if (outbound && cur.writeIfCan) {
              return cur.writeIfCan(req, res, '');
            } else if ((!outbound) && cur.readIfCan) {
              return cur.readIfCan(req);
            } else {
              return {processed: false};
            }
          });
      }), Promise.resolve({processed: false, output: undefined} as any)
    )
      .then((result) => {
        if (result.processed) {
          req.body = result.output;
        }
        next();
      })
      .catch((err) => {
        next(err);
      });
  }

}

@Configuration()
class DefaultWebServerConfiguration implements IWebserverExpressConfigurer {
  constructor() {
    makeToWebserverConfiguration(this);
  }

  configureMessageConverters(messageConverters: IHttpMessageConverter[]): void | Promise<void> {
    messageConverters.push(new JsonHttpMessageConverter());
  }

  expressCustomize(expressBuilder: ConfigurableExpress): void | Promise<void> {
    const moduleBean = beanFactory.getBeanByClass(WebserverExpress);
    const module = moduleBean && moduleBean.getObject();
    if (!module) {
      return Promise.reject(new Error('Something Error (module is null)'));
    }
    const restControllers = beanFactory.getBeansByComponentType(RestController);
    const restRouter = express.Router();
    restControllers
      .forEach(controller => {
        const controllerAttrs: beants.IAttributeAnnotation = controller.getAnnotation(RestController) as beants.IAttributeAnnotation;
        const requestMappings = controller.getMethodsByAnnotation(RequestMapping);
        const controllerOptions: IControllerOptions = controllerAttrs.options || { path: '/' };
        requestMappings.forEach((requestMapping) => {
          const requestMappingAttrs = requestMapping.getAnnotation(RequestMapping) as beants.IAttributeAnnotation;
          const requestMappingOptions: IRequestMappingOptions = requestMappingAttrs.options;
          const joinedPath = controllerOptions.path ?
            joinUrl(controllerOptions.path, requestMappingOptions.path) :
            requestMappingOptions.path;
          const httpMethod = requestMappingOptions.method ? requestMappingOptions.method.toLowerCase() : 'use';

          const parameterGenerator = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const parameterDefinitions = requestMapping.getParameters();
            return parameterDefinitions
              .map(info => {
                if (info) {
                  if (info.attributeType === CONST_HttpRequestParam) {
                    return req;
                  } else if (info.attributeType === CONST_HttpResponseParam) {
                    return res;
                  } else if (info.attributeType === CONST_HttpNextParam) {
                    return next;
                  } else if (info.attributeType === CONST_RequestBody) {
                    return req.body;
                  }
                }
                return undefined;
              });
          };

          (restRouter as any)[httpMethod](joinedPath, (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const parameters = parameterGenerator(req, res, next);
            module[symWrappedRequestRun](req, res, next, requestMapping.bind(controller.getObject(), ...parameters));
          });
        });
      });

    const lastSettings = module[symCurrentSettings];
    if (!lastSettings.contextPath) {
      lastSettings.contextPath = '/';
    }
    expressBuilder.getRouter().use(restRouter);
    expressBuilder.getExpress().use((req, res, next) => module[symExpressMessageConverterHandler](false, req, res, next));
    expressBuilder.getExpress().use(lastSettings.contextPath, expressBuilder.getRouter());
  }
}

export default installer;
