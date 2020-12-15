/**
 * narae.js express module
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

import * as express from 'express';

/**
 * RequestErrorHandler
 *
 * @return handled
 */
export type RequestErrorHandler =
  (req: express.Request, res: express.Response, next: express.NextFunction, e: Error | any) => boolean | Promise<boolean>;

export interface IHttpMessageConverter {
  getName(): string;
  readIfCan?(req: express.Request): Promise<{processed: boolean, output: any}>;
  writeIfCan?(req: express.Request, res: express.Response, data: any): Promise<{processed: boolean}>;
}
