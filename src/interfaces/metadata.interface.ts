import { ReferenceableToken } from './token.interface';

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
