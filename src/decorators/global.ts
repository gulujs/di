import { setGlobalMetadata } from '../helpers/metadata-utils';
import { Type } from '../interfaces';

export function Global(): ClassDecorator {
  return (target: object): void => {
    setGlobalMetadata(target as Type<unknown>, true);
  };
}
