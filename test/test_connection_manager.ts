import {
  installer,
  ConnectionManager,
  IConnectionManagerHandler,
} from '@naraejs/core';

@ConnectionManager()
class GoodConnectionManager implements IConnectionManagerHandler {
  public get name(): string {
    return 'good';
  }

  public get essential(): boolean {
    return true;
  }

  public healthCheck(): Promise<any> {
    return Promise.resolve();
  }
}

@ConnectionManager()
class BadConnectionManager implements IConnectionManagerHandler {
  public get name(): string {
    return 'bad';
  }

  public get essential(): boolean {
    return false;
  }

  public healthCheck(): Promise<any> {
    const e: any = new Error('Bad test');
    e.details = {hello: 'world'};
    return Promise.reject(e);
  }
}

let testCmStatus: boolean = false;

export function setStatus(v: boolean) {
  testCmStatus = v;
}

@ConnectionManager()
class TestConnectionManager implements IConnectionManagerHandler {
  public get name(): string {
    return 'test';
  }

  public get essential(): boolean {
    return true;
  }

  public healthCheck(): Promise<any> {
    if (testCmStatus) {
      return Promise.resolve();
    } else {
      const e: any = new Error('Bad test');
      e.details = {hello: 'world'};
      return Promise.reject(e);
    }
  }
}

export default installer;
