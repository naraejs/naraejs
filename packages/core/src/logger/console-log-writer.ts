import {
  LogLevel,
  LogWithLevel,
  LogWriter
} from './abstract';

const LEVEL_TEXTS: readonly string[] = Object.freeze([
  'TRACE', 'DEBUG', 'INFO ', 'WARN ', 'ERROR', 'FATAL'
]);

export class ConsoleLogWriter implements LogWriter {
  writeLog(log: LogWithLevel): void {
    const timestamp = log.timestamp || new Date();
    const levelText = LEVEL_TEXTS[log.level];
    const line = `[${levelText}] ${timestamp.toISOString()} [${log.namespace}] - ${log.message}`;
    switch (log.level) {
    case LogLevel.TRACE:
    case LogLevel.DEBUG:
    case LogLevel.INFO:
      console.log(line);
      break;
    case LogLevel.WARN:
      console.warn(line);
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(line);
      break;
    }
  }
}
