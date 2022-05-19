// eslint-disable-next-line max-classes-per-file
import {
  isFunction,
  isString,
  isSymbol,
  isUndefined
} from '@lunjs/utils/type';
import {
  ClassProvider,
  CustomProvider,
  DynamicModule,
  DynamicModuleMetadata,
  ExportedComponent,
  FactoryProvider,
  Provider,
  Token,
  AliasProvider,
  Type,
  ValueProvider
} from './interfaces';
import { Container } from './container';
import { InstanceWrapper } from './instance-wrapper';
import { ModuleRef, ModuleRefOptions } from './module-ref';
import { ContextIdFactory } from './context-id-factory';
import { InvlidClassError, UnknownExportError } from './errors';
import {
  isClassProvider,
  isCustomProvider,
  isFactoryProvider,
  isAliasProvider,
  isValueProvider
} from './helpers/provider-utils';
import { isDynamicModule } from './helpers/module-utils';
import {
  getInitMetadata,
  getProviderGroupMetadata,
  getScopeMetadata
} from './helpers/metadata-utils';
import { SearchScope } from './instance-links-host';
import { stringifyToken } from './helpers/token-utils';

export class ModuleWrapper {
  private readonly _imports = new Set<ModuleWrapper>();
  private readonly _providers = new Map<Token, InstanceWrapper>();
  private readonly _groupedProviders = new Map<string | undefined, Map<Token, InstanceWrapper>>();
  private readonly _exports = new Set<Token>();
  private _distance = 0;

  constructor(
    private readonly _id: string,
    private readonly _metatype: Type<unknown>,
    private readonly _dynamicMetadata: DynamicModuleMetadata | undefined,
    private readonly _container: Container
  ) {
    this.addCoreProviders();
  }

  get id(): string {
    return this._id;
  }

  get metatype(): Type<unknown> {
    return this._metatype;
  }

  get dynamicMetadata(): DynamicModuleMetadata | undefined {
    return this._dynamicMetadata;
  }

  get imports(): Set<ModuleWrapper> {
    return this._imports;
  }

  get providers(): Map<Token, InstanceWrapper> {
    return this._providers;
  }

  get exports(): Set<Token> {
    return this._exports;
  }

  get distance(): number {
    return this._distance;
  }

  set distance(value: number) {
    this._distance = value;
  }

  getProvidersByGroup(group: string | undefined): Map<Token, InstanceWrapper> | undefined {
    return this._groupedProviders.get(group);
  }

  getProviderByToken<T>(token: Token<T>): InstanceWrapper<T> | undefined {
    return this._providers.get(token) as InstanceWrapper<T> | undefined;
  }

  getNonAliasProviders(): InstanceWrapper[] {
    return [...this._providers.values()].filter(wrapper => !wrapper.isAlias);
  }

  addRelatedModule(module: ModuleWrapper): void {
    this._imports.add(module);
  }

  async addExportedComponent(component: ExportedComponent): Promise<void> {
    const addExported = (token: Token): void => {
      if (this._providers.has(token)) {
        this._exports.add(token);
        return;
      }

      for (const module of this._imports) {
        if (module.metatype === token) {
          this._exports.add(token);
          return;
        }
      }

      throw new UnknownExportError(stringifyToken(token), this.metatype.name);
    };

    if (isCustomProvider(component as Provider)) {
      const token = (component as CustomProvider).token;
      if (isString(token) || isString(token)) {
        addExported(token);
      } else {
        addExported(token);
      }
      return;
    }

    if (isString(component) || isSymbol(component)) {
      addExported(component);
      return;
    }

    if (isDynamicModule(component as Type<unknown> | DynamicModule)) {
      addExported((component as DynamicModule).module);
      return;
    }

    if (component instanceof Promise) {
      component = await component;
      if (isDynamicModule(component)) {
        addExported(component.module);
        return;
      }
    }

    addExported(component as Type<unknown>);
  }

  addProvider(provider: Provider): void {
    if (isCustomProvider(provider)) {
      this.addCustomProvider(provider);
      return;
    }

    const group = getProviderGroupMetadata(provider);
    const instance = new InstanceWrapper({
      token: provider,
      name: provider.name,
      metatype: provider,
      isResolved: false,
      isNewable: true,
      scope: getScopeMetadata(provider),
      group,
      init: getInitMetadata(provider),
      host: this
    });
    this.addProviderByGroup(group, provider, instance);
  }

  addProviderByGroup(group: string | undefined, token: Token, instance: InstanceWrapper): void {
    this._providers.set(token, instance);

    let collection = this._groupedProviders.get(group);
    if (!collection) {
      collection = new Map();
      this._groupedProviders.set(group, collection);
    }
    collection.set(token, instance);
  }

  private addCustomProvider(provider: CustomProvider): void {
    if (isClassProvider(provider)) {
      this.addCustomClass(provider);
    } else if (isValueProvider(provider)) {
      this.addCustomValue(provider);
    } else if (isFactoryProvider(provider)) {
      this.addCustomFactory(provider);
    } else if (isAliasProvider(provider)) {
      this.addCustomAlias(provider);
    }
  }

  private addCustomClass({
    token,
    useClass,
    scope,
    group
  }: ClassProvider): void {
    if (isUndefined(scope)) {
      scope = getScopeMetadata(useClass);
    }
    if (isUndefined(group)) {
      group = getProviderGroupMetadata(useClass);
    }

    const instance = new InstanceWrapper({
      token,
      name: useClass.name || (isFunction(token) ? token.name : token),
      metatype: useClass,
      isResolved: false,
      isNewable: true,
      scope,
      group,
      init: getInitMetadata(useClass),
      host: this
    });
    this.addProviderByGroup(group, token, instance);
  }

  private addCustomValue({ token, useValue, group }: ValueProvider): void {
    const instance = new InstanceWrapper({
      token,
      name: isFunction(token) ? token.name : token,
      instance: useValue,
      isResolved: true,
      isAsync: useValue instanceof Promise,
      group,
      host: this
    });
    this.addProviderByGroup(group, token, instance);
  }

  private addCustomFactory({
    token,
    useFactory,
    inject,
    scope,
    group
  }: FactoryProvider): void {
    const instance = new InstanceWrapper({
      token,
      name: isFunction(token) ? token.name : token,
      metatype: useFactory,
      isResolved: false,
      inject: inject || [],
      scope,
      group,
      host: this
    });
    this.addProviderByGroup(group, token, instance);
  }

  private addCustomAlias({ token, useToken, group }: AliasProvider): void {
    if (isUndefined(group)) {
      if (isFunction(token)) {
        group = getProviderGroupMetadata(token as Type<unknown>);
      }
      if (isUndefined(group) && isFunction(useToken)) {
        group = getProviderGroupMetadata(useToken as Type<unknown>);
      }
    }
    const instance = new InstanceWrapper({
      token,
      name: isFunction(token) ? token.name : token,
      metatype: (instance: unknown): unknown => instance,
      isResolved: false,
      inject: [useToken],
      isAlias: true,
      group,
      host: this
    });
    this.addProviderByGroup(group, token, instance);
  }

  private addCoreProviders(): void {
    this.addModuleAsProvider();
    this.addModuleRef();
  }

  private addModuleAsProvider(): void {
    this._providers.set(
      this._metatype,
      new InstanceWrapper({
        token: this._metatype,
        name: this._metatype.name,
        metatype: this._metatype,
        isResolved: false,
        isNewable: true,
        host: this
      })
    );
  }

  private addModuleRef(): void {
    const ClassModuleRef = this.createModuleReferenceType();
    this._providers.set(
      ModuleRef,
      new InstanceWrapper({
        token: ModuleRef,
        name: ModuleRef.name,
        metatype: ModuleRef as Type<ModuleRef>,
        isResolved: true,
        instance: new ClassModuleRef(),
        host: this
      })
    );
  }

  private createModuleReferenceType(): Type<ModuleRef> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    return class extends ModuleRef {
      constructor() {
        super(self._container);
      }

      get<TInput = unknown, TResult = TInput>(token: Token<TInput>, options?: ModuleRefOptions): TResult {
        options = options || {};
        return this.find(token, self, {
          searchScope: options.searchScope || SearchScope.ModuleAndImports,
          allowSearchByName: options.allowSearchByName === true
        });
      }

      resolve<TInput = unknown, TResult = TInput>(
        token: Token<TInput>,
        contextId = ContextIdFactory.create(),
        options?: ModuleRefOptions
      ): Promise<TResult> {
        options = options || {};
        return this.resolvePerContext(token, self, contextId, {
          searchScope: options.searchScope || SearchScope.ModuleAndImports,
          allowSearchByName: options.allowSearchByName === true
        });
      }

      create<T = unknown>(type: Type<T>): Promise<T | undefined> {
        if (!isFunction(type) || !type.prototype) {
          throw new InvlidClassError(type);
        }
        return this.instantiateClass<T>(type, self);
      }
    };
  }
}
