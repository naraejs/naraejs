import chai from 'chai';

import * as utils from '../src/utils';

describe('Utils Test', function() {
  it('joinUrl case 1', function () {
    chai.expect(utils.joinUrl('/abc/def', 'ghi/hello')).eq('/abc/def/ghi/hello');
  });
  it('joinUrl case 2', function () {
    chai.expect(utils.joinUrl('/abc/def', '/ghi/hello')).eq('/abc/def/ghi/hello');
  });
  it('joinUrl case 3', function () {
    chai.expect(utils.joinUrl('/abc/def/', 'ghi/hello')).eq('/abc/def/ghi/hello');
  });
  it('joinUrl case 4', function () {
    chai.expect(utils.joinUrl('/abc/def/', '/ghi/hello')).eq( '/abc/def/ghi/hello');
  });
  it('contentType case 1', function () {
    chai.expect(utils.parseContentType('application/json')).eql({
      contentType: 'application/json',
      attributes: {}
    });
  });
  it('contentType case 2', function () {
    chai.expect(utils.parseContentType('application/json;charset=utf8')).eql({
      contentType: 'application/json',
      attributes: {
        charset: 'utf8'
      }
    });
  });
  it('contentType case 3', function () {
    chai.expect(utils.parseContentType('application/json; charset=utf8')).eql({
      contentType: 'application/json',
      attributes: {
        charset: 'utf8'
      }
    });
  });
});
