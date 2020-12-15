/**
 * narae.js serverless module
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

import {
  installer,
  INaraeCore,
  Configuration
} from '@naraejs/core';

import {
  makeToConfiguration,
  IWebserverExpressConfigurer,
  WebserverExpressConfigurationBuilder
} from '@naraejs/webserver-express';

import * as http from 'http';

import * as kubeless from './kubeless';

import * as awsServerlessExpress from 'aws-serverless-express';
import * as awsLambda from 'aws-lambda';

export enum ServerlessPlatform {
  AUTO = 0,
  AWS_LAMBDA = 1,
  KUBELESS = 2,
}

function findServerlessPlatform() {
  if (process.env.LAMBDA_TASK_ROOT) {
    return ServerlessPlatform.AWS_LAMBDA;
  }
  if (process.env.KUBELESS_INSTALL_VOLUME) {
    return ServerlessPlatform.KUBELESS;
  }
  return ServerlessPlatform.AUTO;
}

class WorkingContext {
  public server!: http.Server;
  public serverlessPlatform: ServerlessPlatform | undefined = undefined;
}

const WORKING_CONTEXT = new WorkingContext();

export function createHandler(core: INaraeCore): any;
export function createHandler(core: INaraeCore, serverlessPlatform: ServerlessPlatform.KUBELESS): kubeless.IHandler;
export function createHandler(core: INaraeCore, serverlessPlatform: ServerlessPlatform.AWS_LAMBDA): http.Server;
export function createHandler(core: INaraeCore, serverlessPlatform: ServerlessPlatform): any;
export function createHandler(core: INaraeCore, serverlessPlatform?: ServerlessPlatform): any {
  const _serverlessPlatform = serverlessPlatform || findServerlessPlatform();
  WORKING_CONTEXT.serverlessPlatform = _serverlessPlatform;

  switch (_serverlessPlatform) {
  case ServerlessPlatform.AWS_LAMBDA:
    return (event: awsLambda.APIGatewayProxyEvent, context: awsLambda.Context) => {
      core.readySignal()
        .then(() => {
          awsServerlessExpress.proxy(WORKING_CONTEXT.server, event, context);
        });
    };
  case ServerlessPlatform.KUBELESS:
    return kubeless.createHandler(core);
  }

  throw new Error('Unknown Serverless Platform');
}

@Configuration({
  order: 0
})
class WebConfiguration implements IWebserverExpressConfigurer {
  public constructor() {
    makeToConfiguration(this);
  }

  configure(builder: WebserverExpressConfigurationBuilder) {
    if (typeof WORKING_CONTEXT.serverlessPlatform === 'undefined') {
      throw new Error('YOU MUST CALL createHandler BEFORE narae.js START');
    }

    builder
      .customServer((app) => {
        switch (WORKING_CONTEXT.serverlessPlatform) {
        case ServerlessPlatform.AWS_LAMBDA:
          WORKING_CONTEXT.server = awsServerlessExpress.createServer(app);
          return WORKING_CONTEXT.server;
        case ServerlessPlatform.KUBELESS:
          return null;
        }
        return Promise.reject(new Error('Unknown Serverless Platform'));
      });
  }
}

export default installer;
