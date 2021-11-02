import { ScopeEnum } from '../scope-enum';
import { Provider } from '../interfaces';
import { REQUEST } from './request-constants';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export const requestProvider: Provider = {
  token: REQUEST,
  scope: ScopeEnum.Request,
  useFactory: noop
};
