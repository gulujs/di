import { ForwardReference, TypeForwardRef } from './interfaces';

export function forwardRef(fn: TypeForwardRef): ForwardReference {
  return { forwardRef: fn };
}
