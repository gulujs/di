export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export type FuncType<T> = (...args: any[]) => T | Promise<T>;
