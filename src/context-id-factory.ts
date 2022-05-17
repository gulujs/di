import { ContextId } from './interfaces';

export class ContextIdFactory {
  static create(): ContextId {
    return { id: Math.random() };
  }
}
