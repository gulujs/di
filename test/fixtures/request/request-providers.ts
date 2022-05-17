import { Provider, ScopeEnum } from '../../../src';
import { REQUEST } from './request-constants';

const noop = (): void => {};

export const requestProvider: Provider = {
  token: REQUEST,
  scope: ScopeEnum.Request,
  useFactory: noop
};
