import { RuntimeError } from './runtime-error';

export class UnknownModuleError extends RuntimeError {
  constructor(name?: string) {
    super(`@lunjs/di could not select the ${name || 'given'} module (it does not exist in current context)`);
  }
}
