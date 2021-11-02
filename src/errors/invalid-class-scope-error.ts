import { stringifyToken } from '../helpers/token-utils';
import { Token } from '../interfaces';
import { RuntimeError } from './runtime-error';

export class InvalidClassScopeError extends RuntimeError {
  constructor(token: Token) {
    super(`${stringifyToken(token) || 'This class'} is marked as a scoped provider. Request and transient-scoped providers can't be used in combination with "get()" method. Please, use "resolve()" instead.`);
  }
}
