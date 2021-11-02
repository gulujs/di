import { RuntimeError } from './runtime-error';

export class UnknownElementError extends RuntimeError {
  constructor(name?: string | symbol) {
    super(`@lunjs/di could not find ${String(name || 'given')} element (this provider does not exist in the current context)`);
  }
}
