import { RuntimeError } from './runtime-error';

export class InvlidClassError extends RuntimeError {
  constructor(value: unknown) {
    super(`ModuleRef cannot instantiate class (${value} is not constructable).`);
  }
}
