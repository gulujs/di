export function isUndefined(obj: unknown): obj is undefined {
  return typeof obj === 'undefined';
}

export function isNil(obj: unknown): obj is null | undefined {
  return isUndefined(obj) || obj === null;
}

export function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}

export function isNumber(obj: unknown, strict = false): obj is number {
  return typeof obj === 'number' && (!strict || !Number.isNaN(obj));
}

export function isSymbol(obj: unknown): obj is symbol {
  return typeof obj === 'symbol';
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(obj: unknown): obj is Function {
  return typeof obj === 'function';
}
