/**
 * narae.js kubeless handler
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

import * as url from 'url';
import * as http from 'http';
import {
  INaraeCore,
  beanFactory
} from '@naraejs/core';
import {
  WebserverExpress
} from '@naraejs/webserver-express';

export interface IHandlerEvent {
  'event-type': undefined | string,
  'event-id': undefined | string,
  'event-time': undefined | string,
  'event-namespace': undefined | string,
  'data': any,
  extensions: {
    request: http.IncomingMessage,
    response: http.ServerResponse
  }
}

export interface IHandlerContext {
  'function-name': string,
  timeout: number,
  runtime: string,
  'memory-limit': string
}

export type IHandler = (event: IHandlerEvent, context: IHandlerContext, parsedUrl: url.Url, urlMatchers: RegExpExecArray) => any;

export function createHandler(core: INaraeCore): IHandler {
  return (event: IHandlerEvent, context: IHandlerContext, parsedUrl: url.Url, urlMatchers: RegExpExecArray) => {
    console.log('HANDLER CALLED!', {
      event, context
    });
    return core
      .readySignal()
      .then(() => {
        const webserverBean = beanFactory.getBeanByClass(WebserverExpress);
        const webserverExpress = webserverBean && webserverBean.getObject();
        const expressApp = webserverExpress && webserverExpress.expressApp;
        if (expressApp) {
          expressApp(event.extensions.request, event.extensions.response);
        }
      });
  };
}

/*
    headers: {
      host: '10.1.15.181:8080',
      connection: 'keep-alive',
      pragma: 'no-cache',
      'cache-control': 'no-cache',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
      accept: 'image/avif,image/webp,image/apng,image/*,* /*;q=0.8',
referer: 'http://10.1.15.181:8080/_/health',
  'accept-encoding': 'gzip, deflate',
  'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
},

    params: { '0': '/_/health' },
    query: {},

    baseUrl: '',
    originalUrl: '/_/health',

    headers: {
      host: '10.1.15.181:8080',
      connection: 'keep-alive',
      'cache-control': 'max-age=0',
      'upgrade-insecure-requests': '1',
'accept-encoding': 'gzip, deflate',
  'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
},
rawHeaders: [
  'Host',
  '10.1.15.181:8080',
  'Connection',
  'keep-alive',
  'Cache-Control',
  'max-age=0',
  'Upgrade-Insecure-Requests',
  '1',
  'User-Agent',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
  'Accept',
  'Accept-Encoding',
  'gzip, deflate',
  'Accept-Language',
  'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
],
  trailers: {},
rawTrailers: [],
  aborted: false,
  upgrade: false,
  url: '/_/health',
  method: 'GET',
  statusCode: null,
  statusMessage: null,
  client: Socket {

*/

