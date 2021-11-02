import { Type } from '../interfaces';
import { getInitMetadata, setInitMetadata } from '../helpers/metadata-utils';
import { DecoratorHasBeenAppliedError } from '../errors/decorator-has-been-applied-error';

export function Init(): MethodDecorator {
  return (target: object, key: string | symbol, _descriptor: TypedPropertyDescriptor<any>): void => {
    let init = getInitMetadata(target.constructor as Type<unknown>);
    if (init && init.key !== key) {
      throw new DecoratorHasBeenAppliedError(Init, target.constructor.name, init.key);
    }
    init = { key };
    setInitMetadata(target.constructor as Type<unknown>, init);
  };
}
