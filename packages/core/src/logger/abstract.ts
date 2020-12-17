import { joinNamespaces } from './util';

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL
}

export interface Log {
  timestamp?: Date;
  namespace?: string;
  message: string;
  metadata?: any;
}

export interface LogWithLevel extends Log {
  level: LogLevel;
}

export interface LogWriter {
  writeLog(log: LogWithLevel): void;
}

export interface LoggerLike {
  trace(log: Log): void;
  trace(message: string, metadata?: any): void;
  debug(log: Log): void;
  debug(message: string, metadata?: any): void;
  info(log: Log): void;
  info(message: string, metadata?: any): void;
  warn(log: Log): void;
  warn(message: string, metadata?: any): void;
  error(log: Log): void;
  error(message: string, metadata?: any): void;
  fatal(log: Log): void;
  fatal(message: string, metadata?: any): void;
  log(log: LogWithLevel): void;
  log(level: LogLevel, message: string, metadata?: any): void;
  child(namespace: string): LoggerLike;
}

export abstract class AbstractLogger implements LoggerLike, LogWriter {
  abstract writeLog(log: LogWithLevel): void;

  trace(log: Log): void;
  trace(message: string, metadata?: any): void;
  trace(logOrMsg: Log | string, metadata?: any): void {
    const log: LogWithLevel = (typeof logOrMsg === 'string') ? {
      level: LogLevel.TRACE,
      message: logOrMsg,
      metadata: metadata
    } : {
      ...logOrMsg,
      level: LogLevel.TRACE
    };
    this.log(log);
  }

  debug(log: Log): void;
  debug(message: string, metadata?: any): void;
  debug(logOrMsg: Log | string, metadata?: any): void {
    const log: LogWithLevel = (typeof logOrMsg === 'string') ? {
      level: LogLevel.DEBUG,
      message: logOrMsg,
      metadata: metadata
    } : {
      ...logOrMsg,
      level: LogLevel.DEBUG
    };
    this.log(log);
  }

  info(log: Log): void;
  info(message: string, metadata?: any): void;
  info(logOrMsg: Log | string, metadata?: any): void {
    const log: LogWithLevel = (typeof logOrMsg === 'string') ? {
      level: LogLevel.INFO,
      message: logOrMsg,
      metadata: metadata
    } : {
      ...logOrMsg,
      level: LogLevel.INFO
    };
    this.log(log);
  }

  warn(log: Log): void;
  warn(message: string, metadata?: any): void;
  warn(logOrMsg: Log | string, metadata?: any): void {
    const log: LogWithLevel = (typeof logOrMsg === 'string') ? {
      level: LogLevel.WARN,
      message: logOrMsg,
      metadata: metadata
    } : {
      ...logOrMsg,
      level: LogLevel.WARN
    };
    this.log(log);
  }

  error(log: Log): void;
  error(message: string, metadata?: any): void;
  error(logOrMsg: Log | string, metadata?: any): void {
    const log: LogWithLevel = (typeof logOrMsg === 'string') ? {
      level: LogLevel.ERROR,
      message: logOrMsg,
      metadata: metadata
    } : {
      ...logOrMsg,
      level: LogLevel.ERROR
    };
    this.log(log);
  }

  fatal(log: Log): void;
  fatal(message: string, metadata?: any): void;
  fatal(logOrMsg: Log | string, metadata?: any): void {
    const log: LogWithLevel = (typeof logOrMsg === 'string') ? {
      level: LogLevel.FATAL,
      message: logOrMsg,
      metadata: metadata
    } : {
      ...logOrMsg,
      level: LogLevel.FATAL
    };
    this.log(log);
  }

  log(log: LogWithLevel): void;
  log(level: LogLevel, message: string, metadata?: any): void;
  log(logOrLevel: LogWithLevel | LogLevel, message?: string, metadata?: any): void {
    const timestamp = new Date();
    const log: LogWithLevel = Object.assign({
      timestamp
    }, (typeof logOrLevel === 'object') ? logOrLevel : {
      timestamp,
      level: logOrLevel,
      message: message as string,
      metadata
    });
    this.writeLog(log);
  }

  child(namespace: string): LoggerLike {
    return new ChildLogger(this, namespace);
  }
}

export class ChildLogger extends AbstractLogger implements LogWriter {
  private _parent: LoggerLike;
  private _namespace: string;

  constructor(parent: LoggerLike, namespace: string) {
    super();
    this._parent = parent;
    this._namespace = namespace;
  }

  writeLog(log: LogWithLevel): void {
    this._parent.log({
      ...log,
      namespace: joinNamespaces(this._namespace, log.namespace)
    });
  }
}
