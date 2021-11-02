import { isUndefined } from '../helpers/common-utils';
import { isForwardReference } from '../helpers/forward-reference-utils';
import { isInjectorParamContext } from '../helpers/injector-utils';
import { stringifyToken } from '../helpers/token-utils';
import { InjectorDependencyContext } from '../interfaces';
import { RuntimeError } from './runtime-error';

export class UnknownDependenciesError extends RuntimeError {
  constructor(type: string | symbol, dependencyContext: InjectorDependencyContext, moduleName: string) {
    moduleName = moduleName || 'Module';
    const dependencyName = stringifyToken(dependencyContext.token) || 'dependency';

    let message = `@lunjs/di can't resolve dependencies of the ${String(type)}`;
    const potentialSolutions = `\n
Potential solutions:
- If ${dependencyName} is a provider, is it part of the current ${moduleName}?
- If ${dependencyName} is exported from a separate @Module, is that module imported within ${moduleName}?
  @Module({
    imports: [ /* the Module containing ${dependencyName} */ ]
  })
`;

    if (!isInjectorParamContext(dependencyContext)) {
      message += `. Please make sure that the "${String(dependencyContext.key)}" property is available in the current context.${potentialSolutions}`;

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

      message += ' (';
      message += dependenciesName.join(', ');
      message += `). Please make sure that the argument ${dependencyName} at index [${dependencyContext.index}] is available in the ${moduleName} context.`;
      message += potentialSolutions;
    }

    super(message);
  }
}
