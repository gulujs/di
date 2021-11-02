import { ReferenceableToken } from './token';

export interface ParamMetadata {
  index: number;
  token?: ReferenceableToken;
}

export interface PropertyMetadata {
  key: string | symbol;
  token?: ReferenceableToken;
}

export interface InitMetadata {
  key: string | symbol;
}
