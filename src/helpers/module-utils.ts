import { DynamicModule, Type } from '../interfaces';
import {
  getModuleExportsMetadata,
  getModuleImportsMetadata,
  getModuleProvidersMetadata,
  getModuleProvidersScanPathsMetadata
} from './metadata-utils';

export function isDynamicModule(module: Type<unknown> | DynamicModule): module is DynamicModule {
  return !!(module as Partial<DynamicModule>).module;
}

export function isClassicalModule(module: unknown): module is Type<unknown> {
  return !!(
    getModuleProvidersMetadata(module as Type<unknown>)
    || getModuleProvidersScanPathsMetadata(module as Type<unknown>)
    || getModuleImportsMetadata(module as Type<unknown>)
    || getModuleExportsMetadata(module as Type<unknown>)
  );
}
