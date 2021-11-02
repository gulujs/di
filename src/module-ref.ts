import { ModuleWrapper } from './module-wrapper';
import { Container } from './container';
import { ContextId, Token, Type } from './interfaces';
import { Injector } from './injector';
import { InstanceWrapper } from './instance-wrapper';
import { InvalidClassScopeError, UnknownElementError } from './errors';
import { ScopeEnum } from './scope-enum';
import { getInitMetadata, getScopeMetadata } from './helpers/metadata-utils';
import { InstanceLinksHost, SearchScope } from './instance-links-host';
import { stringifyToken } from './helpers/token-utils';


export interface ModuleRefOptions {
  searchScope?: SearchScope;
  allowSearchByName?: boolean;
}

export abstract class ModuleRef {
  private readonly _injector = new Injector();
  private _instanceLinksHost?: InstanceLinksHost;

  private get instanceLinksHost(): InstanceLinksHost {
    if (!this._instanceLinksHost) {
      this._instanceLinksHost = new InstanceLinksHost(this.container);
    }
    return this._instanceLinksHost;
  }

  constructor(protected readonly container: Container) {}

  abstract get<TInput = unknown, TResult = TInput>(
    token: Token<TInput>,
    options?: ModuleRefOptions
  ): TResult;

  abstract resolve<TInput = unknown, TResult = TInput>(
    token: Token<TInput>,
    contextId?: ContextId,
    options?: ModuleRefOptions
  ): Promise<TResult>;

  abstract create<T = unknown>(type: Type<T>): Promise<T | undefined>;

  protected find<TInput = unknown, TResult = TInput>(
    token: Token<TInput>,
    module: ModuleWrapper,
    options: Required<ModuleRefOptions>
  ): TResult {
    const { wrapper } = this.instanceLinksHost.get<TResult>(token, module, options.searchScope, options.allowSearchByName);
    if (wrapper.scope === ScopeEnum.Request || wrapper.scope === ScopeEnum.Transient) {
      throw new InvalidClassScopeError(token);
    }
    return wrapper.instance!;
  }

  protected async resolvePerContext<TInput = unknown, TResult = TInput>(
    token: Token<TInput>,
    module: ModuleWrapper,
    contextId: ContextId,
    options: Required<ModuleRefOptions>
  ): Promise<TResult> {
    const { wrapper, module: targetModule } = this.instanceLinksHost.get<TResult>(token, module, options.searchScope, options.allowSearchByName);

    const instance = await this._injector.loadPerContext(wrapper, targetModule, contextId);
    if (!instance) {
      throw new UnknownElementError(stringifyToken(token));
    }
    return instance;
  }

  protected async instantiateClass<T = unknown>(type: Type<T>, module: ModuleWrapper): Promise<T | undefined> {
    const wrapper = new InstanceWrapper({
      token: type,
      name: type.name,
      metatype: type,
      isResolved: false,
      isNewable: true,
      scope: getScopeMetadata(type),
      init: getInitMetadata(type),
      host: module
    });

    const [isResolved, params] = await this._injector.resolveConstructorParams(wrapper, module);
    if (!isResolved) {
      return;
    }

    const properties = await this._injector.resolveProperties(wrapper, module);

    // eslint-disable-next-line new-cap
    const instance = new type(...params);

    for (const property of properties) {
      (instance as Record<string | symbol, unknown>)[property.key] = property.instance;
    }

    if (wrapper.init) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      await (instance as any)[wrapper.init.key]();
    }

    return instance;
  }
}
