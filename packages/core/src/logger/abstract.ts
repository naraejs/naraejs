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
  error?: Error | undefined;
}

export interface LogWithLevel extends Log {
  level: LogLevel;
}

export interface LogWriter {
  writeLog(log: LogWithLevel): void;
}

//TODO: ERROR
export interface LoggerLike {
  trace(log: Log): void;
  trace(message: string, metadata?: any): void;
  trace(message: string, error: any, metadata?: any): void;
  debug(log: Log): void;
  debug(message: string, metadata?: any): void;
  debug(message: string, error: any, metadata?: any): void;
  info(log: Log): void;
  info(message: string, metadata?: any): void;
  info(message: string, error: any, metadata?: any): void;
  warn(log: Log): void;
  warn(message: string, metadata?: any): void;
  warn(message: string, error: any, metadata?: any): void;
  error(log: Log): void;
  error(message: string, metadata?: any): void;
  error(message: string, error: any, metadata?: any): void;
  fatal(log: Log): void;
  fatal(message: string, metadata?: any): void;
  fatal(message: string, error: any, metadata?: any): void;
  log(log: LogWithLevel): void;
  log(level: LogLevel, message: string, metadata?: any): void;
  log(level: LogLevel, message: string, error: any, metadata?: any): void;
  child(namespace: string): LoggerLike;
}

export abstract class AbstractLogger implements LoggerLike, LogWriter {
  abstract writeLog(log: LogWithLevel): void;

  trace(log: Log): void;
  trace(message: string, metadata?: any): void;
  trace(message: string, error: Error, metadata?: any): void;
  trace(logOrMsg: Log | string, errorOrMetadata?: Error | any, metadata?: any): void {
    if (typeof logOrMsg === 'string') {
      this.log(LogLevel.TRACE, logOrMsg, errorOrMetadata, metadata);
    } else {
      this.log({
        ...logOrMsg,
        level: LogLevel.TRACE
      });
    }
  }

  debug(log: Log): void;
  debug(message: string, metadata?: any): void;
  debug(message: string, error: Error, metadata?: any): void;
  debug(logOrMsg: Log | string, errorOrMetadata?: Error | any, metadata?: any): void {
    if (typeof logOrMsg === 'string') {
      this.log(LogLevel.DEBUG, logOrMsg, errorOrMetadata, metadata);
    } else {
      this.log({
        ...logOrMsg,
        level: LogLevel.DEBUG
      });
    }
  }

  info(log: Log): void;
  info(message: string, metadata?: any): void;
  info(message: string, error: Error, metadata?: any): void;
  info(logOrMsg: Log | string, errorOrMetadata?: Error | any, metadata?: any): void {
    if (typeof logOrMsg === 'string') {
      this.log(LogLevel.INFO, logOrMsg, errorOrMetadata, metadata);
    } else {
      this.log({
        ...logOrMsg,
        level: LogLevel.INFO
      });
    }
  }

  warn(log: Log): void;
  warn(message: string, metadata?: any): void;
  warn(message: string, error: Error, metadata?: any): void;
  warn(logOrMsg: Log | string, errorOrMetadata?: Error | any, metadata?: any): void {
    if (typeof logOrMsg === 'string') {
      this.log(LogLevel.WARN, logOrMsg, errorOrMetadata, metadata);
    } else {
      this.log({
        ...logOrMsg,
        level: LogLevel.WARN
      });
    }
  }

  error(log: Log): void;
  error(message: string, metadata?: any): void;
  error(message: string, error: Error, metadata?: any): void;
  error(logOrMsg: Log | string, errorOrMetadata?: Error | any, metadata?: any): void {
    if (typeof logOrMsg === 'string') {
      this.log(LogLevel.ERROR, logOrMsg, errorOrMetadata, metadata);
    } else {
      this.log({
        ...logOrMsg,
        level: LogLevel.ERROR
      });
    }
  }

  fatal(log: Log): void;
  fatal(message: string, metadata?: any): void;
  fatal(message: string, error: Error, metadata?: any): void;
  fatal(logOrMsg: Log | string, errorOrMetadata?: Error | any, metadata?: any): void {
    if (typeof logOrMsg === 'string') {
      this.log(LogLevel.FATAL, logOrMsg, errorOrMetadata, metadata);
    } else {
      this.log({
        ...logOrMsg,
        level: LogLevel.FATAL
      });
    }
  }

  log(log: LogWithLevel): void;
  log(level: LogLevel, message: string, metadata?: any): void;
  log(level: LogLevel, message: string, error: Error, metadata?: any): void;
  log(logOrLevel: LogWithLevel | LogLevel, message?: string, errorOrMetadata?: Error | any, metadata?: any): void {
    const _error: Error | undefined = (errorOrMetadata && errorOrMetadata instanceof Error) ? errorOrMetadata : undefined;
    const _metadata: any | undefined = _error ? metadata : errorOrMetadata;
    const timestamp = new Date();
    const log: LogWithLevel = Object.assign({
      timestamp,
      error: _error,
      metadata: _metadata
    }, (typeof logOrLevel === 'object') ? logOrLevel : {
      timestamp,
      level: logOrLevel,
      message: message as string,
      error: _error,
      metadata: _metadata
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
