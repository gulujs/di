import { Type } from './interfaces';
import { RandomStringFactory } from './random-string-factory';

export class TypeIdFactory {
  private static readonly _typeIdsCache = new WeakMap<Type<unknown>, string>();

  static get(type: Type<unknown>): string {
    let id = this._typeIdsCache.get(type);
    if (!id) {
      id = RandomStringFactory.create();
      this._typeIdsCache.set(type, id);
    }
    return id;
  }
}
