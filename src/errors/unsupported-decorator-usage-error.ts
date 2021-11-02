import { DecoratorFactory } from '../interfaces';
import { RuntimeError } from './runtime-error';

export class UnsupportedDecoratorUsageError extends RuntimeError {
  constructor(decorator: DecoratorFactory, supports: string[]) {
    super(`Decorator @${decorator.name}() can only be applied to ${supports.join(', ')}.`);
  }
}
