import { Abstract } from './abstract.interface';
import { ForwardReference } from './forward-reference.interface';
import { Type } from './type.interface';

export type Token<T = unknown> = string | symbol | Type<T> | Abstract<T>;
export type ReferenceableToken = Token | ForwardReference;
