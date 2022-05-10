import { Type } from './type.interface';
import { Token } from './token.interface';
import { ScopeType } from './scope-type.interface';

export type Provider<T = unknown> = Type<T> | CustomProvider<T>;

export type CustomProvider<T = unknown>
  = ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | AliasProvider<T>;

export interface ClassProvider<T = unknown> {
  token: Token;
  useClass: Type<T>;
  scope?: ScopeType;
  group?: string;
}

export interface ValueProvider<T = unknown> {
  token: Token;
  useValue: T;
  group?: string;
}

export interface FactoryProvider<T = unknown> {
  token: Token;
  useFactory: (...args: any[]) => T;
  inject?: Token[];
  scope?: ScopeType;
  group?: string;
}

// @ts-expect-error unused generic type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface AliasProvider<T = unknown> {
  token: Token;
  useToken: Token;
  group?: string;
}
