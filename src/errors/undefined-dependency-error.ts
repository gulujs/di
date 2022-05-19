import { isUndefined } from '@lunjs/utils/type';
import { isForwardReference } from '../helpers/forward-reference-utils';
import { isInjectorParamContext } from '../helpers/injector-utils';
import { stringifyToken } from '../helpers/token-utils';
import { InjectorDependencyContext } from '../interfaces';
import { RuntimeError } from './runtime-error';

export class UndefinedDependencyError extends RuntimeError {
  constructor(type: string | symbol, dependencyContext: InjectorDependencyContext) {
    let message = `@lunjs/di can't resolve dependencies of the ${String(type)}`;

    if (!isInjectorParamContext(dependencyContext)) {
      message += `. The "${String(dependencyContext.key)}" property of the ${String(type)} is undefined.

Potential causes:
- A circular dependency between providers. Use forwardRef() to avoid it.
- The "${String(dependencyContext.key)}" property is of type "undefined". Check the class and the type of the property.
`;

    } else {
      const dependenciesName = dependencyContext.params.map((token) => {
        if (isUndefined(token)) {
          return '+';
        }
        if (isForwardReference(token)) {
          token = token.forwardRef();
        }
        return stringifyToken(token) || '+';
      });
      dependenciesName[dependencyContext.index] = '?';

      message += ` (${dependenciesName.join(', ')}). The argument at index [${dependencyContext.index}] of the ${String(type)} arguments is undefined.

Potential causes:
- A circular dependency between providers. Use forwardRef() to avoid it.
- The argument at index [${dependencyContext.index}] is of type "undefined". Check the constructor method / factory function and the type of the arguments.
`;
    }

    super(message);
  }
}
