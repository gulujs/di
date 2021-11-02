import { ReferenceableToken, Token } from './token';

export interface InjectorParamContext {
  token: Token;
  index: number;
  params: ReferenceableToken[];
}

export interface InjectorPropertyContext {
  token: Token;
  key: string | symbol;
}

export type InjectorDependencyContext = InjectorParamContext | InjectorPropertyContext;
