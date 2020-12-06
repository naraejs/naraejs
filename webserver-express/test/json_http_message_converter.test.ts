import * as stream from 'stream';

import chai from 'chai';

import { JsonHttpMessageConverter } from '../src/message_converter/json_http_message_converter';

function mockContentType(req: any, contentType: string) {
  req.header = (name: string) => {
    if (name === 'content-type') {
      return contentType;
    }
    return undefined;
  };
}

describe('JsonHttpMessageConverter Test', function() {
  const converter = new JsonHttpMessageConverter();
  it('non-json', () => {
    const req: any = new stream.PassThrough();
    mockContentType(req, 'text/plain');
    const p = converter.readIfCan(req);
    req.write(Buffer.from('{"hello": "WORLD"}'));
    req.end();
    return p
      .then((result) => {
        chai.expect(result).eql({processed: false, output: undefined});
      });
  });
  it('json without charset', () => {
    const req: any = new stream.PassThrough();
    mockContentType(req, 'application/json');
    const p = converter.readIfCan(req);
    const buf = Buffer.from('eyJoZWxsbyI6IldPUkxEIiwiaGFuZ3VsIjoi7ZWc6riAIn0=', 'base64');
    req.write(buf);
    req.end();
    return p
      .then((result) => {
        chai.expect(result).eql({processed: true, output: JSON.parse(buf.toString('utf8'))});
      });
  });
});
