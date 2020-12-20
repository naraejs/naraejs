import { LogLevel, LogWithLevel, LogWriter} from './abstract';
import { ConsoleLogWriter } from './console-log-writer';

export interface LogBind {
  namespace: string;
  level?: LogLevel;
  writers: LogWriter[];
}

export class LogBridge implements LogWriter {
  private _bindings: LogBind[] = [];

  public static getInstance(): LogBridge {
    return instance;
  }

  public writeLog(log: LogWithLevel): void {
    const logNamespace = log.namespace || '';
    this._bindings.forEach((item) => {
      const itemLevel = (typeof item.level === 'undefined') ? LogLevel.TRACE : item.level;
      if ((log.level >= itemLevel) && (item.namespace === 'root' || logNamespace === item.namespace || logNamespace.startsWith(item.namespace + '.'))) {
        item.writers.forEach((writer) => {
          writer.writeLog(log);
        });
      }
    });
  }

  public getBindings() {
    return this._bindings;
  }

  public addBinding(bind: LogBind) {
    this._bindings.push(bind);
  }
}
const instance = new LogBridge();
instance.addBinding({namespace: 'root', level: LogLevel.INFO, writers: [new ConsoleLogWriter()]});
