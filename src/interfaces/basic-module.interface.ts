import { Type } from './type.interface';
import { DynamicModuleMetadata } from './dynamic-module.interface';

export interface BasicModule {
  id: string;
  metatype: Type<unknown>;
  dynamicMetadata?: DynamicModuleMetadata;
}
