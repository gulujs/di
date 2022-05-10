import { STATIC_CONTEXT } from './constants';
import { isUndefined } from './helpers/common-utils';
import { isForwardReference } from './helpers/forward-reference-utils';
import { getConstructorParamsMetadata } from './helpers/metadata-utils';
import {
  ContextId,
  FuncType,
  InitMetadata,
  ScopeType,
  Token,
  Type
} from './interfaces';
import { ModuleWrapper } from './module-wrapper';
import { RandomStringFactory } from './random-string-factory';
import { ScopeEnum } from './scope-enum';

export interface InstanceWrapperMetadata<T = unknown> {
  token: Token;
  name: string | symbol;
  metatype?: Type<T> | FuncType<T>;
  isResolved: boolean;
  instance?: T;
  inject?: Token[];
  scope?: ScopeType;
  isAsync?: boolean;
  host?: ModuleWrapper;
  isNewable?: boolean;
  isAlias?: boolean;
  group?: string;
  init?: InitMetadata;
}

export interface InstancePerContext<T> {
  instance?: T;
  isResolved: boolean;
  donePromise?: Promise<void>;
}

export interface InstancePropertyMetadata {
  key: string | symbol;
  wrapper: InstanceWrapper;
}

export class InstanceWrapper<T = unknown> {
  readonly token: Token;
  readonly name: string | symbol;
  readonly metatype?: Type<T> | FuncType<T>;
  readonly scope: ScopeType;
  readonly inject?: Token[];
  readonly host?: ModuleWrapper;
  readonly isForwardRef: boolean;
  readonly isNewable: boolean;
  readonly isAlias: boolean;
  readonly isAsync: boolean;
  readonly group?: string;
  readonly init?: InitMetadata;

  private readonly _id = RandomStringFactory.create();
  private readonly _values = new WeakMap<ContextId, InstancePerContext<T>>();
  private readonly _transientMap?: Map<string, WeakMap<ContextId, InstancePerContext<T>>>;
  private _isTreeStatic?: boolean;

  private _params?: InstanceWrapper[];
  private _properties?: InstancePropertyMetadata[];

  constructor(metadata: InstanceWrapperMetadata<T>) {
    this.token = metadata.token;
    this.name = metadata.name;
    this.metatype = metadata.metatype;
    this.scope = metadata.scope || ScopeEnum.Singleton;
    this.inject = metadata.inject;
    this.host = metadata.host;
    this.isNewable = metadata.isNewable === true;
    this.isAlias = metadata.isAlias === true;
    this.isAsync = metadata.isAsync === true;
    this.group = metadata.group;
    this.init = metadata.init;

    this.isForwardRef = false;
    if (this.isNewable) {
      const params = getConstructorParamsMetadata(this.metatype as Type<unknown>);
      if (params) {
        this.isForwardRef = params.some(p => p.token && isForwardReference(p.token));
      }
    }

    const instancePerContext = this.createInstance(STATIC_CONTEXT);
    if (metadata.isResolved) {
      instancePerContext.instance = metadata.instance;
      instancePerContext.isResolved = metadata.isResolved;
    }

    if (this.isTransient) {
      this._transientMap = new Map();
    }
  }

  get id(): string {
    return this._id;
  }

  get instance(): T | undefined {
    return this.getInstanceByContextId(STATIC_CONTEXT).instance;
  }

  get isTransient(): boolean {
    return this.scope === ScopeEnum.Transient;
  }

  getInstanceByContextId(contextId: ContextId, inquirer?: InstanceWrapper): InstancePerContext<T> {
    if (this.isTransient && inquirer) {
      return this.getInstanceByInquirer(contextId, inquirer);
    }

    const instancePerContext = this._values.get(contextId);
    if (instancePerContext) {
      return instancePerContext;
    }
    return this.cloneStaticInstance(contextId);
  }

  setInstanceByContextId(contextId: ContextId, value: InstancePerContext<T>, inquirer?: InstanceWrapper): void {
    if (this.isTransient && inquirer) {
      this.setInstanceByInquirer(contextId, inquirer, value);
      return;
    }

    this._values.set(contextId, value);
  }

  getCtorParamsMetadata(): InstanceWrapper[] | undefined {
    return this._params;
  }

  addCtorParamsMetadata(index: number, wrapper: InstanceWrapper): void {
    if (!this._params) {
      this._params = [];
    }
    this._params[index] = wrapper;
  }

  getPropertiesMetadata(): InstancePropertyMetadata[] | undefined {
    return this._properties;
  }

  addPropertiesMetadata(key: string | symbol, wrapper: InstanceWrapper): void {
    if (!this._properties) {
      this._properties = [];
    }
    this._properties.push({ key, wrapper });
  }

  private getInstanceByInquirer(contextId: ContextId, inquirer: InstanceWrapper): InstancePerContext<T> {
    let collection = this._transientMap!.get(inquirer.id);
    if (!collection) {
      collection = new WeakMap();
      this._transientMap!.set(inquirer.id, collection);
    }
    const instancePerContext = collection.get(contextId);
    if (instancePerContext) {
      return instancePerContext;
    }
    return this.cloneTransientInstance(contextId, inquirer);
  }

  private setInstanceByInquirer(contextId: ContextId, inquirer: InstanceWrapper, value: InstancePerContext<T>): void {
    let collection = this._transientMap!.get(inquirer.id);
    if (!collection) {
      collection = new WeakMap();
      this._transientMap!.set(inquirer.id, collection);
    }
    collection.set(contextId, value);
  }

  createInstance(contextId: ContextId, inquirer?: InstanceWrapper): InstancePerContext<T> {
    const instancePerContext: InstancePerContext<T> = {
      instance: undefined,
      isResolved: false
    };
    if (this.isNewable && this.isForwardRef) {
      instancePerContext.instance = Object.create(this.metatype!.prototype as object) as T;
    }
    this.setInstanceByContextId(contextId, instancePerContext, inquirer);
    return instancePerContext;
  }

  cloneStaticInstance(contextId: ContextId): InstancePerContext<T> {
    if (this.isDependencyTreeStatic()) {
      return this.getInstanceByContextId(STATIC_CONTEXT);
    }
    return this.createInstance(contextId);
  }

  cloneTransientInstance(contextId: ContextId, inquirer: InstanceWrapper): InstancePerContext<T> {
    return this.createInstance(contextId, inquirer);
  }

  isDependencyTreeStatic(lookupRegistry: string[] = []): boolean {
    if (!isUndefined(this._isTreeStatic)) {
      return this._isTreeStatic;
    }

    if (this.scope === ScopeEnum.Request) {
      this._isTreeStatic = false;
      return this._isTreeStatic;
    }

    if (lookupRegistry.includes(this._id)) {
      return true;
    }

    lookupRegistry = lookupRegistry.concat(this._id);

    let isStatic = true;
    if (this._params) {
      isStatic = this._params.every(it => it.isDependencyTreeStatic(lookupRegistry));
    }

    if (!isStatic || !this._properties) {
      this._isTreeStatic = isStatic;
      return this._isTreeStatic;
    }

    this._isTreeStatic = this._properties.every(it => it.wrapper.isDependencyTreeStatic(lookupRegistry));
    return this._isTreeStatic;
  }

  getStaticTransientInstances(): InstancePerContext<T>[] {
    if (!this._transientMap) {
      return [];
    }

    return [...this._transientMap.values()]
      .map(it => it.get(STATIC_CONTEXT))
      .filter(it => it) as InstancePerContext<T>[];
  }
}
