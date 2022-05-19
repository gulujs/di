import { isUndefined } from '@lunjs/utils/type';
import { STATIC_CONTEXT } from './constants';
import { isForwardReference } from './helpers/forward-reference-utils';
import { getConstructorParamsMetadata, getPropertiesMetadata } from './helpers/metadata-utils';
import { INQUIRER_KEY_OR_INDEX, INQUIRER_TYPE } from './inquirer';
import {
  Inquirer,
  InstancePerContext,
  InstanceStore
} from './instance-store';
import {
  ContextId,
  FuncType,
  InitMetadata,
  ParamMetadata,
  PropertyMetadata,
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
  readonly hasInquirerTypeToken: boolean;
  readonly hasInquirerKeyOrIndexToken: boolean;

  private readonly _id = RandomStringFactory.create();

  private readonly _instanceStore: InstanceStore<T>;

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
    this.hasInquirerTypeToken = false;
    this.hasInquirerKeyOrIndexToken = false;
    if (this.isNewable) {
      const params = getConstructorParamsMetadata(this.metatype as Type<unknown>);
      if (params) {
        this.isForwardRef = params.some(p => p.token && isForwardReference(p.token));
        [this.hasInquirerTypeToken, this.hasInquirerKeyOrIndexToken] = this.checkInquirerTokenExists(params);
      }
      if (!this.hasInquirerKeyOrIndexToken) {
        const properties = getPropertiesMetadata(this.metatype as Type<unknown>);
        if (properties) {
          [this.hasInquirerTypeToken, this.hasInquirerKeyOrIndexToken] = this.checkInquirerTokenExists(properties, this.hasInquirerTypeToken);
        }
      }

    } else if (!metadata.isResolved && !this.isAlias) {
      this.hasInquirerTypeToken = this.inject!.includes(INQUIRER_TYPE);
      this.hasInquirerKeyOrIndexToken = this.inject!.includes(INQUIRER_KEY_OR_INDEX);
    }

    this._instanceStore = new InstanceStore(this);

    if (!this.hasInquirerTypeToken && !this.hasInquirerKeyOrIndexToken) {
      const instancePerContext = this.createInstance(STATIC_CONTEXT);
      if (metadata.isResolved) {
        instancePerContext.instance = metadata.instance;
        instancePerContext.isResolved = metadata.isResolved;
      }
    } else {
      // Once inject INQUIRER_TYPE or INQUIRER_KEY_OR_INDEX,
      // the scope of provider will be implicitly changed to `ScopeEnum.Transient`.
      this.scope = ScopeEnum.Transient;
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

  getInstanceByContextId(
    contextId: ContextId,
    inquirer?: Inquirer
  ): InstancePerContext<T> {
    if (this.isTransient) {
      const instancePerContext = this._instanceStore.getTransientInstance(contextId, inquirer);
      if (instancePerContext) {
        return instancePerContext;
      }
      return this.cloneTransientInstance(contextId, inquirer);
    }

    const instancePerContext = this._instanceStore.getInstance(contextId);
    if (instancePerContext) {
      return instancePerContext;
    }
    return this.cloneStaticInstance(contextId);
  }

  setInstanceByContextId(
    contextId: ContextId,
    value: InstancePerContext<T>,
    inquirer?: Inquirer
  ): void {
    if (this.isTransient) {
      this._instanceStore.setTransientInstance(contextId, value, inquirer);
      return;
    }

    this._instanceStore.setInstance(contextId, value);
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

  createInstance(contextId: ContextId, inquirer?: Inquirer): InstancePerContext<T> {
    const instancePerContext: InstancePerContext<T> = {
      instance: undefined,
      isResolved: false
    };
    if (this.isNewable && this.isForwardRef && !this.isTransient) {
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

  cloneTransientInstance(contextId: ContextId, inquirer?: Inquirer): InstancePerContext<T> {
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
    if (!this.isTransient) {
      return [];
    }

    return this._instanceStore.getAllTransientInstances(STATIC_CONTEXT);
  }

  private checkInquirerTokenExists(
    params: ParamMetadata[] | PropertyMetadata[],
    hasInquirerTypeToken = false
  ): [boolean, boolean] {
    let hasInquirerKeyOrIndexToken = false;

    for (const param of params) {
      if (!param.token) {
        continue;
      }
      if (param.token === INQUIRER_KEY_OR_INDEX) {
        hasInquirerKeyOrIndexToken = true;
      } else if (param.token === INQUIRER_TYPE) {
        hasInquirerTypeToken = true;
      }
      if (hasInquirerTypeToken && hasInquirerKeyOrIndexToken) {
        break;
      }
    }

    return [hasInquirerTypeToken, hasInquirerKeyOrIndexToken];
  }
}
