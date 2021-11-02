import { Type } from './type';
import { DynamicModuleMetadata } from './dynamic-module';

export interface BasicModule {
  id: string;
  metatype: Type<unknown>;
  dynamicMetadata?: DynamicModuleMetadata;
}
