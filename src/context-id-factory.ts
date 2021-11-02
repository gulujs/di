import { ContextId } from './interfaces';
import { REQUEST_CONTEXT_ID } from './request';

export class ContextIdFactory {
  static create(): ContextId {
    return { id: Math.random() };
  }

  static getByRequest<T extends Record<any, unknown> = any>(request?: T): ContextId {
    if (!request) {
      return this.create();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if ((request as any)[REQUEST_CONTEXT_ID]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return (request as any)[REQUEST_CONTEXT_ID] as ContextId;
    }

    return this.create();
  }

  static setForRequest<T extends Record<any, unknown> = any>(request: T, contextId: ContextId): void {
    Object.defineProperty(request, REQUEST_CONTEXT_ID, {
      value: contextId,
      enumerable: false,
      writable: false,
      configurable: false
    });
  }
}
