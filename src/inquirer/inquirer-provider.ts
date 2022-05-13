import { Provider } from '../interfaces';
import { ScopeEnum } from '../scope-enum';
import { INQUIRER_KEY_OR_INDEX, INQUIRER_TYPE } from './inquirer-constants';


// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export const inquirerTypeProvider: Provider = {
  token: INQUIRER_TYPE,
  scope: ScopeEnum.Transient,
  useFactory: noop
};

export const inquirerKeyOrIndexProvider: Provider = {
  token: INQUIRER_KEY_OR_INDEX,
  scope: ScopeEnum.Transient,
  useFactory: noop
};
