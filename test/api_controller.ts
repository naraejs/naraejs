import {
  installer,
  RequestMapping,
  RequestBody
} from '@naraejs/core';

import {
  RestController
} from '@naraejs/webserver-express';

@RestController({
  path: '/api'
})
class ApiController {
  @RequestMapping({
    path: '/add',
    method: 'get'
  })
  getAdd() {
    return 'GET ADD METHOD';
  }

  @RequestMapping({
    path: '/add',
    method: 'post'
  })
  postAdd(@RequestBody() body: any) {
    return {
      value: (body.a + body.b)
    };
  }
}

export default installer;
