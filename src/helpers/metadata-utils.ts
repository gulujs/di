import {
  DESIGN_PARAMTYPES_METADATA,
  DESIGN_TYPE_METADATA,
  DI_CONSTRUCTOR_PARAMS_METADATA,
  DI_GLOBAL_METADATA,
  DI_INIT_METADATA,
  DI_INJECTABLE_METADATA,
  DI_MODULE_EXPORTS_METADATA,
  DI_MODULE_IMPORTS_METADATA,
  DI_MODULE_PROVIDERS_METADATA,
  DI_MODULE_PROVIDERS_SCAN_PATHS_METADATA,
  DI_OPTIONAL_CONSTRUCTOR_PARAMS_METADATA,
  DI_OPTIONAL_PROPERTIES_METADATA,
  DI_PROPERTIES_METADATA,
  DI_PROVIDER_GROUP_METADATA,
  DI_SCOPE_METADATA
} from '../constants';
import {
  ExportedComponent,
  InitMetadata,
  ParamMetadata,
  PropertyMetadata,
  Provider,
  RawModule,
  ScopeType,
  Type
} from '../interfaces';

export function getDesignParamtypesMetadata<T>(type: object): T | undefined;
export function getDesignParamtypesMetadata<T>(type: object, propertyKey: string | symbol): T | undefined;
export function getDesignParamtypesMetadata<T>(type: object, propertyKey?: string | symbol): T | undefined {
  // @ts-expect-error propertyKey may be undefined
  return Reflect.getMetadata(DESIGN_PARAMTYPES_METADATA, type, propertyKey) as T | undefined;
}

export function getDesignTypeMetadata<T>(type: object, propertyKey: string | symbol): T | undefined {
  return Reflect.getMetadata(DESIGN_TYPE_METADATA, type, propertyKey) as T | undefined;
}

export function getConstructorParamsMetadata(type: Type<unknown>): ParamMetadata[] | undefined {
  return Reflect.getMetadata(DI_CONSTRUCTOR_PARAMS_METADATA, type) as ParamMetadata[] | undefined;
}
export function setConstructorParamsMetadata(type: Type<unknown>, value: ParamMetadata[]): void {
  Reflect.defineMetadata(DI_CONSTRUCTOR_PARAMS_METADATA, value, type);
}

export function getOptionalConstructorParamsMetadata(type: Type<unknown>): number[] | undefined {
  return Reflect.getMetadata(DI_OPTIONAL_CONSTRUCTOR_PARAMS_METADATA, type) as number[] | undefined;
}
export function setOptionalConstructorParamsMetadata(type: Type<unknown>, value: number[]): void {
  Reflect.defineMetadata(DI_OPTIONAL_CONSTRUCTOR_PARAMS_METADATA, value, type);
}

export function getPropertiesMetadata(type: Type<unknown>): PropertyMetadata[] | undefined {
  return Reflect.getMetadata(DI_PROPERTIES_METADATA, type) as PropertyMetadata[] | undefined;
}
export function setPropertiesMetadata(type: Type<unknown>, value: PropertyMetadata[]): void {
  Reflect.defineMetadata(DI_PROPERTIES_METADATA, value, type);
}

export function getOptionalPropertiesMetadata(type: Type<unknown>): Array<string | symbol> | undefined {
  return Reflect.getMetadata(DI_OPTIONAL_PROPERTIES_METADATA, type) as Array<string | symbol> | undefined;
}
export function setOptionalPropertiesMetadata(type: Type<unknown>, value: Array<string | symbol>): void {
  Reflect.defineMetadata(DI_OPTIONAL_PROPERTIES_METADATA, value, type);
}

export function getInjectableMetadata(type: Type<unknown>): boolean | undefined {
  return Reflect.getMetadata(DI_INJECTABLE_METADATA, type) as boolean | undefined;
}
export function setInjectableMetadata(type: Type<unknown>, value: boolean): void {
  Reflect.defineMetadata(DI_INJECTABLE_METADATA, value, type);
}

export function getProviderGroupMetadata(type: Type<unknown>): string | undefined {
  return Reflect.getMetadata(DI_PROVIDER_GROUP_METADATA, type) as string | undefined;
}
export function setProviderGroupMetadata(type: Type<unknown>, value: string): void {
  Reflect.defineMetadata(DI_PROVIDER_GROUP_METADATA, value, type);
}

export function getScopeMetadata(type: Type<unknown>): ScopeType | undefined {
  return Reflect.getMetadata(DI_SCOPE_METADATA, type) as ScopeType | undefined;
}
export function setScopeMetadata(type: Type<unknown>, value: ScopeType): void {
  Reflect.defineMetadata(DI_SCOPE_METADATA, value, type);
}

export function getGlobalMetadata(type: Type<unknown>): boolean | undefined {
  return Reflect.getMetadata(DI_GLOBAL_METADATA, type) as boolean | undefined;
}
export function setGlobalMetadata(type: Type<unknown>, value: boolean): void {
  Reflect.defineMetadata(DI_GLOBAL_METADATA, value, type);
}

export function getInitMetadata(type: Type<unknown>): InitMetadata | undefined {
  return Reflect.getMetadata(DI_INIT_METADATA, type) as InitMetadata | undefined;
}
export function setInitMetadata(type: Type<unknown>, value: InitMetadata): void {
  Reflect.defineMetadata(DI_INIT_METADATA, value, type);
}

export function getModuleImportsMetadata(type: Type<unknown>): RawModule[] | undefined {
  return Reflect.getMetadata(DI_MODULE_IMPORTS_METADATA, type) as RawModule[] | undefined;
}
export function setModuleImportsMetadata(type: Type<unknown>, value: RawModule[]): void {
  Reflect.defineMetadata(DI_MODULE_IMPORTS_METADATA, value, type);
}

export function getModuleProvidersScanPathsMetadata(type: Type<unknown>): string[] | undefined {
  return Reflect.getMetadata(DI_MODULE_PROVIDERS_SCAN_PATHS_METADATA, type) as string[] | undefined;
}
export function setModuleProvidersScanPathsMetadata(type: Type<unknown>, value: string[]): void {
  Reflect.defineMetadata(DI_MODULE_PROVIDERS_SCAN_PATHS_METADATA, value, type);
}

export function getModuleProvidersMetadata(type: Type<unknown>): Provider[] | undefined {
  return Reflect.getMetadata(DI_MODULE_PROVIDERS_METADATA, type) as Provider[] | undefined;
}
export function setModuleProvidersMetadata(type: Type<unknown>, value: Provider[]): void {
  Reflect.defineMetadata(DI_MODULE_PROVIDERS_METADATA, value, type);
}

export function getModuleExportsMetadata(type: Type<unknown>): ExportedComponent[] | undefined {
  return Reflect.getMetadata(DI_MODULE_EXPORTS_METADATA, type) as ExportedComponent[] | undefined;
}
export function setModuleExportsMetadata(type: Type<unknown>, value: ExportedComponent[]): void {
  Reflect.defineMetadata(DI_MODULE_EXPORTS_METADATA, value, type);
}
