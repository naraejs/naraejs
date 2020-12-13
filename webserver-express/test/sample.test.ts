import chai from 'chai';
import request from 'supertest';

import * as naraejs from '@naraejs/core';

import * as webserverExpress from '../src';
naraejs.install(webserverExpress);

import * as apiControllerInstall from '../../test/api_controller';
naraejs.install(apiControllerInstall);

import * as testConnectionManager from '../../test/test_connection_manager';
naraejs.install(testConnectionManager);

@naraejs.Configuration()
class WebserverConfiguration implements webserverExpress.IWebserverExpressConfigurer {
  constructor() {
    webserverExpress.makeToConfiguration(this);
  }

  configure(builder: webserverExpress.WebserverExpressConfigurationBuilder): void | Promise<void> {
    builder.listenEnable(false);
  }
}

const app = naraejs.create();

let server: any;

describe('Sample Project Test', function() {
  before(() =>
    app.start()
      .then(() => {
        const webserverBean = naraejs.beanFactory.getBeanByClass(webserverExpress.WebserverExpress);
        server = webserverBean && webserverBean.getObject().expressApp;
      })
  );
  it('http get /_/health should up', function (done) {
    testConnectionManager.setStatus(true);
    request(server)
      .get('/_/health')
      .expect(200, {'status':'UP','details':{'good':{'status':'UP'},'bad':{'status':'DOWN','details':{'hello':'world'}},'test':{'status':'UP'}}})
      .end(done);
  });
  it('http get /_/health should down', function (done) {
    testConnectionManager.setStatus(false);
    request(server)
      .get('/_/health')
      .expect(500, {'status':'DOWN','details':{'good':{'status':'UP'},'bad':{'status':'DOWN','details':{'hello':'world'}},'test':{'status':'DOWN','details':{'hello':'world'}}}})
      .end(done);
  });
  it('http get /api/add', function (done) {
    request(server)
      .get('/api/add')
      .expect(200, 'GET ADD METHOD')
      .end(done);
  });
  it('http post /api/add', function (done) {
    request(server)
      .post('/api/add')
      .set('Content-Type', 'application/json')
      .send({a: 10, b: 20})
      .expect('Content-Type', /^application\/json/)
      .expect(200, {value: 30})
      .end(done);
  });
});
