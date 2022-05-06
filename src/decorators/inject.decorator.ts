import { ReferenceableToken, Type } from '../interfaces';
import {
  getConstructorParamsMetadata,
  getDesignTypeMetadata,
  getPropertiesMetadata,
  setConstructorParamsMetadata,
  setPropertiesMetadata
} from '../helpers/metadata-utils';
import { UnsupportedDecoratorUsageError } from '../errors';

export function Inject(token?: ReferenceableToken) {
  return (target: object, key: string | symbol, index?: number): void => {
    // class constructor params
    if (typeof key === 'undefined' && typeof index === 'number') {
      let params = getConstructorParamsMetadata(target as Type<unknown>) || [];
      params = [
        ...params,
        {
          index,
          token
        }
      ];
      setConstructorParamsMetadata(target as Type<unknown>, params);
      return;
    }

    // class properties
    if (typeof key !== 'undefined' && typeof index === 'undefined') {
      token = token || getDesignTypeMetadata(target, key);
      let properties = getPropertiesMetadata(target.constructor as Type<unknown>) || [];
      properties = [
        ...properties,
        {
          key,
          token
        }
      ];
      setPropertiesMetadata(target.constructor as Type<unknown>, properties);
      return;
    }

    throw new UnsupportedDecoratorUsageError(Inject, ['Constructor Parameter', 'Property']);
  };
}
