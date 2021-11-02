import { setInjectableMetadata } from '../helpers/metadata-utils';
import { Type } from '../interfaces';

export function Injectable(): ClassDecorator {
  return (target: object): void => {
    setInjectableMetadata(target as Type<unknown>, true);
  };
}
