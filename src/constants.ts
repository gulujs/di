import { ContextId } from './interfaces';

export const DESIGN_TYPE_METADATA = 'design:type';
export const DESIGN_PARAMTYPES_METADATA = 'design:paramtypes';
export const DI_INJECTABLE_METADATA = '@lunjs/di:injectable';
export const DI_PROVIDER_GROUP_METADATA = '@lunjs/di:provider_group';
export const DI_GLOBAL_METADATA = '@lunjs/di:global';
export const DI_SCOPE_METADATA = '@lunjs/di:scope';
export const DI_CONSTRUCTOR_PARAMS_METADATA = '@lunjs/di:ctor_params';
export const DI_OPTIONAL_CONSTRUCTOR_PARAMS_METADATA = '@lunjs/di:optional_ctor_params';
export const DI_PROPERTIES_METADATA = '@lunjs/di:properties';
export const DI_OPTIONAL_PROPERTIES_METADATA = '@lunjs/di:optional_properties';
export const DI_INIT_METADATA = '@lunjs/di:init';
export const DI_MODULE_IMPORTS_METADATA = '@lunjs/di:module_imports';
export const DI_MODULE_PROVIDERS_SCAN_PATHS_METADATA = '@lunjs/di:module_providers_scan_paths';
export const DI_MODULE_PROVIDERS_METADATA = '@lunjs/di:module_providers';
export const DI_MODULE_EXPORTS_METADATA = '@lunjs/di:module_exports';

export const STATIC_CONTEXT: ContextId = Object.freeze({ id: 0 });

export const SCANNER_FILE_FILTER = ['*.js', '*.mjs'];
const REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if ((process as any)[REGISTER_INSTANCE]) {
  SCANNER_FILE_FILTER.push('*.ts');
}
Object.freeze(SCANNER_FILE_FILTER);
