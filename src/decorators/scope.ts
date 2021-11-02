import { setScopeMetadata } from '../helpers/metadata-utils';
import { ScopeType, Type } from '../interfaces';

export function Scope(scope: ScopeType): ClassDecorator {
  return (target: object): void => {
    setScopeMetadata(target as Type<unknown>, scope);
  };
}
