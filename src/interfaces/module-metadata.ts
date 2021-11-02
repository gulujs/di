import { Abstract } from './abstract';
import { Type } from './type';
import { Provider } from './provider';
import { DynamicModule } from './dynamic-module';
import { ForwardReference } from './forward-reference';

export type RawModule = Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference;
export type ExportedComponent = string | symbol | Provider | RawModule | Abstract<unknown>;

export interface ModuleMetadata {
  imports?: RawModule[];
  scanPaths?: string[];
  providers?: Provider[];
  exports?: ExportedComponent[];
}
