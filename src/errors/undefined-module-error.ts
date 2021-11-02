import { isUndefined } from '../helpers/common-utils';
import { RuntimeError } from './runtime-error';

export class UndefinedModuleError extends RuntimeError {
  constructor(scope?: string[], parentModuleName?: string, index?: number) {
    parentModuleName = parentModuleName || 'Module';

    let message = `@lunjs/di cannot create the ${parentModuleName} instance.`;

    if (isUndefined(index)) {
      message += ' Often, this is because of a circular dependency between modules. Use forwardRef() to avoid it.';
    } else {
      message += `
The module at index [${index}] of the ${parentModuleName} "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Use forwardRef() to avoid it.
- The module at index [${index}] is of type "undefined". Check your import statements and the type of the module.`;
    }

    if (scope?.length) {
      message += `

Scope [${scope.join(' -> ')}]`;
    }

    super(message);
  }
}
