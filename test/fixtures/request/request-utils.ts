import {
  Container,
  ContextId,
  ContextIdFactory
} from '../../../src';
import { REQUEST, REQUEST_CONTEXT_ID } from './request-constants';

export function getByRequest<T extends Record<any, unknown> = any>(request?: T): ContextId {
  if (!request) {
    return ContextIdFactory.create();
  }

  if ((request as any)[REQUEST_CONTEXT_ID]) {
    return (request as any)[REQUEST_CONTEXT_ID] as ContextId;
  }

  return ContextIdFactory.create();
}

export function setForRequest<T extends Record<any, unknown> = any>(request: T, contextId: ContextId): void {
  Object.defineProperty(request, REQUEST_CONTEXT_ID, {
    value: contextId,
    enumerable: false,
    writable: false,
    configurable: false
  });
}

export function registerRequestProvider<T = unknown>(container: Container, request: T, contextId: ContextId): void {
  const wrapper = container.internalCoreModule!.getProviderByToken(REQUEST);
  wrapper!.setInstanceByContextId(contextId, { instance: request, isResolved: true });
}
