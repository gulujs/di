/**
 * Once inject INQUIRER_TYPE, the scope of provider will be implicitly changed to `ScopeEnum.Transient`.
 */
export const INQUIRER_TYPE = Symbol.for('@lunjs/di:inquirer_type');
/**
 * Once inject INQUIRER_KEY_OR_INDEX, the scope of provider will be implicitly changed to `ScopeEnum.Transient`.
 */
export const INQUIRER_KEY_OR_INDEX = Symbol.for('@lunjs/di:inquirer_key_or_index');
