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
  BeanType, IBeanOptions
} from 'bean.ts';

import {
  beanFactory,
  installer
} from './bean-factory';

export const CONST_Configuration = 'Configuration';
export interface IConfigurationOptions extends IBeanOptions {
  order: number;
}
export function Configuration(options?: IConfigurationOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: CONST_Configuration,
    beanType: BeanType.Singletone,
    beanName: options && options.name,
    options: options
  });
}

export const CONST_Module = 'Module';
export interface IModuleOptions extends IBeanOptions {
  order: number;
}
export function Module(options?: IModuleOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: CONST_Module,
    beanType: BeanType.Singletone,
    beanName: options && options.name,
    options: options
  });
}

export const CONST_Service = 'Service';
export function Service(options?: IBeanOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: CONST_Service,
    beanType: BeanType.Singletone,
    beanName: options && options.name
  });
}

export function Component(options?: IBeanOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: 'Component',
    beanType: BeanType.Singletone,
    beanName: options && options.name
  });
}

export const CONST_ConnectionManager = 'ConnectionManager';
export function ConnectionManager(options?: IBeanOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: CONST_ConnectionManager,
    beanType: BeanType.Singletone,
    beanName: options && options.name
  });
}

export interface IControllerOptions extends IBeanOptions {
  path?: string;
}

export const CONST_RestController = 'RestController';
export function RestController(options?: IControllerOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: CONST_RestController,
    beanType: BeanType.Singletone,
    beanName: options && options.name,
    options: options
  });
}

export interface IRequestMappingOptions extends IBeanOptions {
  path: string,
  method?: string
}

export const CONST_RequestMapping = 'RequestMapping';
export function RequestMapping(options: IRequestMappingOptions) {
  return beanFactory.makeMethodAttributeAnnotation({
    attributeType: CONST_RequestMapping,
    options: options
  });
}

export const CONST_HttpRequestParam = 'HttpRequestParam';
export function HttpRequestParam() {
  return beanFactory.makeMethodParameterAnnotation({
    attributeType: CONST_HttpRequestParam,
    options: null
  });
}

export const CONST_HttpResponseParam = 'HttpResponseParam';
export function HttpResponseParam() {
  return beanFactory.makeMethodParameterAnnotation({
    attributeType: CONST_HttpResponseParam,
    options: null
  });
}

export const CONST_HttpNextParam = 'HttpNextParam';
export function HttpNextParam() {
  return beanFactory.makeMethodAttributeAnnotation({
    attributeType: CONST_HttpNextParam,
    options: null
  });
}

export const CONST_RequestBody = 'RequestBody';
export function RequestBody() {
  return beanFactory.makeMethodParameterAnnotation({
    attributeType: CONST_RequestBody,
    options: null
  });
}

export const Inject = beanFactory.Inject.bind(beanFactory);
export const Autowired = beanFactory.Autowired.bind(beanFactory);
export const PostConstruct = beanFactory.PostConstruct.bind(beanFactory);
export const PreDestroy = beanFactory.PreDestroy.bind(beanFactory);
