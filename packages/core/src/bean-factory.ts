/**
 * narae.js core
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

import {
  install, BeanFactory
} from 'bean.ts';

export {
  install
};

export const beanFactory = new BeanFactory();

export const installer = beanFactory.installer.bind(beanFactory);
