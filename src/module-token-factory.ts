import hash from 'object-hash';
import stringify from 'fast-safe-stringify';
import { isFunction, isSymbol } from '@lunjs/utils/type';
import { DynamicModuleMetadata, Type } from './interfaces';
import { TypeIdFactory } from './type-id-factory';

export class ModuleTokenFactory {
  create(type: Type<unknown>, dynamicMetadata?: DynamicModuleMetadata): string {
    const opaqueToken = {
      id: TypeIdFactory.get(type),
      module: type.name,
      dynamic: this.getDynamicMetadataToken(dynamicMetadata)
    };
    return hash(opaqueToken, { ignoreUnknown: true });
  }

  getDynamicMetadataToken(dynamicMetadata?: DynamicModuleMetadata): string {
    if (!dynamicMetadata) {
      return '';
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return stringify(dynamicMetadata, this.replacer);
  }

  private replacer(_key: string, value: unknown): unknown {
    if (isFunction(value)) {
      const funcAsString = value.toString();
      if (/^class\s/.test(funcAsString)) {
        return `Class(${TypeIdFactory.get(value as Type<unknown>)})`;
      }
      return `Function(${hash(funcAsString)})`;
    }
    if (isSymbol(value)) {
      return value.toString();
    }
    return value;
  }
}
