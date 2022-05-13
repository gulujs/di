import {
  METADATA_KEY_DESIGN_PARAMTYPES,
  METADATA_KEY_DESIGN_TYPE,
  METADATA_KEY_DI_CONSTRUCTOR_PARAMS,
  METADATA_KEY_DI_GLOBAL,
  METADATA_KEY_DI_INIT,
  METADATA_KEY_DI_INJECTABLE,
  METADATA_KEY_DI_MODULE_EXPORTS,
  METADATA_KEY_DI_MODULE_IMPORTS,
  METADATA_KEY_DI_MODULE_PROVIDERS,
  METADATA_KEY_DI_MODULE_PROVIDERS_SCAN_PATHS,
  METADATA_KEY_DI_OPTIONAL_CONSTRUCTOR_PARAMS,
  METADATA_KEY_DI_OPTIONAL_PROPERTIES,
  METADATA_KEY_DI_PROPERTIES,
  METADATA_KEY_DI_PROVIDER_GROUP,
  METADATA_KEY_DI_SCOPE
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
  return Reflect.getMetadata(METADATA_KEY_DESIGN_PARAMTYPES, type, propertyKey) as T | undefined;
}

export function getDesignTypeMetadata<T>(type: object, propertyKey: string | symbol): T | undefined {
  return Reflect.getMetadata(METADATA_KEY_DESIGN_TYPE, type, propertyKey) as T | undefined;
}

export function getConstructorParamsMetadata(type: Type<unknown>): ParamMetadata[] | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_CONSTRUCTOR_PARAMS, type) as ParamMetadata[] | undefined;
}
export function setConstructorParamsMetadata(type: Type<unknown>, value: ParamMetadata[]): void {
  Reflect.defineMetadata(METADATA_KEY_DI_CONSTRUCTOR_PARAMS, value, type);
}

export function getOptionalConstructorParamsMetadata(type: Type<unknown>): number[] | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_OPTIONAL_CONSTRUCTOR_PARAMS, type) as number[] | undefined;
}
export function setOptionalConstructorParamsMetadata(type: Type<unknown>, value: number[]): void {
  Reflect.defineMetadata(METADATA_KEY_DI_OPTIONAL_CONSTRUCTOR_PARAMS, value, type);
}

export function getPropertiesMetadata(type: Type<unknown>): PropertyMetadata[] | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_PROPERTIES, type) as PropertyMetadata[] | undefined;
}
export function setPropertiesMetadata(type: Type<unknown>, value: PropertyMetadata[]): void {
  Reflect.defineMetadata(METADATA_KEY_DI_PROPERTIES, value, type);
}

export function getOptionalPropertiesMetadata(type: Type<unknown>): Array<string | symbol> | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_OPTIONAL_PROPERTIES, type) as Array<string | symbol> | undefined;
}
export function setOptionalPropertiesMetadata(type: Type<unknown>, value: Array<string | symbol>): void {
  Reflect.defineMetadata(METADATA_KEY_DI_OPTIONAL_PROPERTIES, value, type);
}

export function getInjectableMetadata(type: Type<unknown>): boolean | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_INJECTABLE, type) as boolean | undefined;
}
export function setInjectableMetadata(type: Type<unknown>, value: boolean): void {
  Reflect.defineMetadata(METADATA_KEY_DI_INJECTABLE, value, type);
}

export function getProviderGroupMetadata(type: Type<unknown>): string | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_PROVIDER_GROUP, type) as string | undefined;
}
export function setProviderGroupMetadata(type: Type<unknown>, value: string): void {
  Reflect.defineMetadata(METADATA_KEY_DI_PROVIDER_GROUP, value, type);
}

export function getScopeMetadata(type: Type<unknown>): ScopeType | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_SCOPE, type) as ScopeType | undefined;
}
export function setScopeMetadata(type: Type<unknown>, value: ScopeType): void {
  Reflect.defineMetadata(METADATA_KEY_DI_SCOPE, value, type);
}

export function getGlobalMetadata(type: Type<unknown>): boolean | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_GLOBAL, type) as boolean | undefined;
}
export function setGlobalMetadata(type: Type<unknown>, value: boolean): void {
  Reflect.defineMetadata(METADATA_KEY_DI_GLOBAL, value, type);
}

export function getInitMetadata(type: Type<unknown>): InitMetadata | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_INIT, type) as InitMetadata | undefined;
}
export function setInitMetadata(type: Type<unknown>, value: InitMetadata): void {
  Reflect.defineMetadata(METADATA_KEY_DI_INIT, value, type);
}

export function getModuleImportsMetadata(type: Type<unknown>): RawModule[] | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_MODULE_IMPORTS, type) as RawModule[] | undefined;
}
export function setModuleImportsMetadata(type: Type<unknown>, value: RawModule[]): void {
  Reflect.defineMetadata(METADATA_KEY_DI_MODULE_IMPORTS, value, type);
}

export function getModuleProvidersScanPathsMetadata(type: Type<unknown>): string[] | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_MODULE_PROVIDERS_SCAN_PATHS, type) as string[] | undefined;
}
export function setModuleProvidersScanPathsMetadata(type: Type<unknown>, value: string[]): void {
  Reflect.defineMetadata(METADATA_KEY_DI_MODULE_PROVIDERS_SCAN_PATHS, value, type);
}

export function getModuleProvidersMetadata(type: Type<unknown>): Provider[] | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_MODULE_PROVIDERS, type) as Provider[] | undefined;
}
export function setModuleProvidersMetadata(type: Type<unknown>, value: Provider[]): void {
  Reflect.defineMetadata(METADATA_KEY_DI_MODULE_PROVIDERS, value, type);
}

export function getModuleExportsMetadata(type: Type<unknown>): ExportedComponent[] | undefined {
  return Reflect.getMetadata(METADATA_KEY_DI_MODULE_EXPORTS, type) as ExportedComponent[] | undefined;
}
export function setModuleExportsMetadata(type: Type<unknown>, value: ExportedComponent[]): void {
  Reflect.defineMetadata(METADATA_KEY_DI_MODULE_EXPORTS, value, type);
}
