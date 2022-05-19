import { isNumber } from '@lunjs/utils/type';
import { InjectorDependencyContext, InjectorParamContext } from '../interfaces';

export function isInjectorParamContext(dependencyContext: InjectorDependencyContext): dependencyContext is InjectorParamContext {
  return isNumber((dependencyContext as InjectorParamContext).index);
}
