import { Abstract } from './abstract';
import { ForwardReference } from './forward-reference';
import { Type } from './type';

export type Token<T = unknown> = string | symbol | Type<T> | Abstract<T>;
export type ReferenceableToken = Token | ForwardReference;
