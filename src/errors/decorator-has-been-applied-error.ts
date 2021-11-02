import { DecoratorFactory } from '../interfaces';
import { RuntimeError } from './runtime-error';

export class DecoratorHasBeenAppliedError extends RuntimeError {
  constructor(decorator: DecoratorFactory, className: string, propertyName: string | symbol) {
    super(`Decorator @${decorator.name}() has already been applied to ${className}${propertyName ? `.${String(propertyName)}` : ''}`);
  }
}
