import { BeanType, IBeanOptions} from 'bean.ts';
import { beanFactory } from '@naraejs/core';

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

