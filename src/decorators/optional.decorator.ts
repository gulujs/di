import { isNumber, isUndefined } from '@lunjs/utils/type';
import { Type } from '../interfaces';
import {
  getOptionalConstructorParamsMetadata,
  getOptionalPropertiesMetadata,
  setOptionalConstructorParamsMetadata,
  setOptionalPropertiesMetadata
} from '../helpers/metadata-utils';
import { UnsupportedDecoratorUsageError } from '../errors';

export function Optional() {
  return (target: object, key: string | symbol, index?: number): void => {
    // class constructor params
    if (isUndefined(key) && isNumber(index)) {
      const params = getOptionalConstructorParamsMetadata(target as Type<unknown>) || [];
      setOptionalConstructorParamsMetadata(target as Type<unknown>, [...params, index]);
      return;
    }

    // class properties
    if (!isUndefined(key) && isUndefined(index)) {
      const properties = getOptionalPropertiesMetadata(target.constructor as Type<unknown>) || [];
      setOptionalPropertiesMetadata(target.constructor as Type<unknown>, [...properties, key]);
      return;
    }

    throw new UnsupportedDecoratorUsageError(Optional, ['Constructor Parameter', 'Property']);
  };
}
