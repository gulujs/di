import { ReferenceableToken, Token } from '../interfaces';
import { isFunction } from './common-utils';
import { isForwardReference } from './forward-reference-utils';

export function stringifyToken(token: Token): string {
  token = isFunction(token) ? token.name : token;
  return String(token || '');
}

export function resolveToken(token: ReferenceableToken): Token {
  if (isForwardReference(token)) {
    return token.forwardRef();
  }
  return token;
}
