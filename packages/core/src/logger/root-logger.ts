import {
  LogWithLevel,
  LogWriter,
  AbstractLogger
} from './abstract';

export class RootLogger extends AbstractLogger {
  public writer: LogWriter;

  constructor(writer: LogWriter) {
    super();
    this.writer = writer;
  }

  writeLog(log: LogWithLevel): void {
    this.writer.writeLog(log);
  }
}
