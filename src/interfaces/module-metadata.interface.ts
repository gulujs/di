import { Abstract } from './abstract.interface';
import { Type } from './type.interface';
import { Provider } from './provider.interface';
import { DynamicModule } from './dynamic-module.interface';
import { ForwardReference } from './forward-reference.interface';

export type RawModule = Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference;
export type ExportedComponent = string | symbol | Provider | RawModule | Abstract<unknown>;

export interface ModuleMetadata {
  imports?: RawModule[];
  scanPaths?: string[];
  providers?: Provider[];
  exports?: ExportedComponent[];
}
