import { ForwardReference, RawModule, ReferenceableToken } from '../interfaces';

export function isForwardReference(token: ReferenceableToken): token is ForwardReference;
export function isForwardReference(module: RawModule): module is ForwardReference;
export function isForwardReference(obj: RawModule | ReferenceableToken): obj is ForwardReference {
  return !!(obj as ForwardReference | undefined)?.forwardRef;
}
