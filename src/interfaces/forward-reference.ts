import { Type } from './type';

export type TypeForwardRef = () => Type<unknown>;
export interface ForwardReference<T = TypeForwardRef> {
  forwardRef: T;
}
