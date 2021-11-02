import { Type } from './type';
import { ModuleMetadata } from './module-metadata';

export interface DynamicModule extends ModuleMetadata {
  module: Type<unknown>;
  global?: boolean;
}

export type DynamicModuleMetadata = Omit<DynamicModule, 'module'>;
