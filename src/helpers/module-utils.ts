import { DynamicModule, Type } from '../interfaces';

export function isDynamicModule(module: Type<unknown> | DynamicModule): module is DynamicModule {
  return !!(module as Partial<DynamicModule>).module;
}
