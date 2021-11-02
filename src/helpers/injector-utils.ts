import { InjectorDependencyContext, InjectorParamContext } from '../interfaces';
import { isNumber } from './common-utils';

export function isInjectorParamContext(dependencyContext: InjectorDependencyContext): dependencyContext is InjectorParamContext {
  return isNumber((dependencyContext as InjectorParamContext).index);
}
