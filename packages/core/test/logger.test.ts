import * as chai from 'chai';
const expect = chai.expect;

import {
  Slf,
  Slfable,
  LoggerLike,
  LogWriter,
  LogWithLevel,
  ConsoleLogWriter,
  setSlfWriter
} from '../src/logger';

import {
  beanFactory,
  Component
} from '../src';

@Slf()
class LogableModel implements Slfable {
  public log!: LoggerLike;

  public test(): boolean {
    this.log.warn('HELLO');
    return true;
  }
}

@Component()
@Slf()
class LogableComponentType1 implements Slfable {
  public log!: LoggerLike;

  public test1(): boolean {
    this.log.warn('HELLO');
    return true;
  }
}

@Slf()
@Component()
class LogableComponentType2 implements Slfable {
  public log!: LoggerLike;

  public test2(): boolean {
    this.log.warn('HELLO');
    return true;
  }
}

class CustomLogWriter implements LogWriter {
  public writtenList: LogWithLevel[] = [];
  writeLog(log: LogWithLevel): void {
    this.writtenList.push({
      level: log.level,
      message: log.message
    });
  }
}

const consoleLogWriter = new ConsoleLogWriter();

describe('Logger Tests', function () {
  beforeEach(() => beanFactory.start());
  afterEach(() => beanFactory.stop());
  it('Slf applied model test', () => {
    const a = new LogableModel();
    const b = new LogableModel();
    expect(a.test()).to.true;
    expect(b.test()).to.true;
  });
  it('Slf applied component test 1', () => {
    const bean = beanFactory.getBeanByClass(LogableComponentType1);
    const obj: LogableComponentType1 = (bean && bean.getObject()) as LogableComponentType1;
    expect(obj).to.exist;
    expect(obj.test1()).to.true;
  });
  it('Slf applied component test 2', () => {
    const bean = beanFactory.getBeanByClass(LogableComponentType2);
    const obj: LogableComponentType2 = (bean && bean.getObject()) as LogableComponentType2;
    expect(obj).to.exist;
    expect(obj.test2()).to.true;
  });
  it('Custom Log Writer', () => {
    const customWriter = new CustomLogWriter();
    setSlfWriter(customWriter);

    const a = new LogableModel();
    a.test();

    const bean = beanFactory.getBeanByClass(LogableComponentType1);
    const obj: LogableComponentType1 = (bean && bean.getObject()) as LogableComponentType1;
    obj.test1();

    expect(customWriter.writtenList).to.eql([
      {
        level: 3,
        message: 'HELLO'
      },
      {
        level: 3,
        message: 'HELLO'
      }
    ]);

    setSlfWriter(consoleLogWriter);
  });
});
