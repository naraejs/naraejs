import * as express from 'express';

import {
  IHttpMessageConverter
} from '../types';

import {
  parseContentType
} from '../utils';

export class JsonHttpMessageConverter implements IHttpMessageConverter {
  getName() {
    return 'JsonHttpMessageConverter';
  }

  readIfCan(req: express.Request): Promise<{ processed: boolean; output: any }> {
    const contentType = parseContentType(req.header('content-type'));
    if (!contentType || contentType.contentType.toLowerCase() !== 'application/json') {
      return Promise.resolve({output: undefined, processed: false});
    }
    return new Promise<{ processed: boolean; output: any }>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req
        .on('data', (chunk) => {
          chunks.push(chunk);
        })
        .on('end', () => {
          try {
            const charset = contentType.attributes['charset'] || 'utf8';
            resolve({
              processed: true,
              output: JSON.parse(Buffer.concat(chunks).toString(charset as any))
            });
          } catch (e) {
            reject(e);
          }
        });
    });
  }

  writeIfCan(req: express.Request, res: express.Response, data: any): Promise<{ processed: boolean }> {
    return Promise.resolve({processed: false});
  }
}
