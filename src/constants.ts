import { ContextId } from './interfaces';

export const METADATA_KEY_DESIGN_TYPE = 'design:type';
export const METADATA_KEY_DESIGN_PARAMTYPES = 'design:paramtypes';
export const METADATA_KEY_DI_INJECTABLE = '@lunjs/di:injectable';
export const METADATA_KEY_DI_PROVIDER_GROUP = '@lunjs/di:provider_group';
export const METADATA_KEY_DI_GLOBAL = '@lunjs/di:global';
export const METADATA_KEY_DI_SCOPE = '@lunjs/di:scope';
export const METADATA_KEY_DI_CONSTRUCTOR_PARAMS = '@lunjs/di:ctor_params';
export const METADATA_KEY_DI_OPTIONAL_CONSTRUCTOR_PARAMS = '@lunjs/di:optional_ctor_params';
export const METADATA_KEY_DI_PROPERTIES = '@lunjs/di:properties';
export const METADATA_KEY_DI_OPTIONAL_PROPERTIES = '@lunjs/di:optional_properties';
export const METADATA_KEY_DI_INIT = '@lunjs/di:init';
export const METADATA_KEY_DI_MODULE_IMPORTS = '@lunjs/di:module_imports';
export const METADATA_KEY_DI_MODULE_PROVIDERS_SCAN_PATHS = '@lunjs/di:module_providers_scan_paths';
export const METADATA_KEY_DI_MODULE_PROVIDERS = '@lunjs/di:module_providers';
export const METADATA_KEY_DI_MODULE_EXPORTS = '@lunjs/di:module_exports';

export const STATIC_CONTEXT: ContextId = Object.freeze({ id: 0 });

export const SCANNER_FILE_FILTER = ['*.js', '*.mjs'];
const REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if ((process as any)[REGISTER_INSTANCE]) {
  SCANNER_FILE_FILTER.push('*.ts');
}
Object.freeze(SCANNER_FILE_FILTER);
