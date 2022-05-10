import { Type } from './type.interface';

export type TypeForwardRef = () => Type<unknown>;
export interface ForwardReference<T = TypeForwardRef> {
  forwardRef: T;
}
