import { isFunction, isNil } from './helpers/common-utils';

export class MetadataScanner {
  scanFromPrototype<R = unknown>(
    prototype: object,
    callback: (name: string) => R
  ): R[] {
    const methodNames = new Set(this.getAllFilteredMethodNames(prototype));
    return [...methodNames].map(callback).filter(metadata => !isNil(metadata));
  }

  getAllFilteredMethodNames(prototype: object): IterableIterator<string>;
  * getAllFilteredMethodNames(prototype: object | null): IterableIterator<string> {
    const isMethod = (prop: string): boolean => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, prop)!;
      if (descriptor.set || descriptor.get) {
        return false;
      }

      return prop !== 'constructor'
        && isFunction((prototype as Record<string, unknown>)[prop]);
    };

    do {
      yield* Object.getOwnPropertyNames(prototype!).filter(isMethod);
    } while (
      // eslint-disable-next-line no-cond-assign
      (prototype = Reflect.getPrototypeOf(prototype!))
      && prototype !== Object.prototype
    );
  }
}
