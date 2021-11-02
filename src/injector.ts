import {
  RuntimeError,
  UndefinedDependencyError,
  UnknownDependenciesError
} from './errors';
import { STATIC_CONTEXT } from './constants';
import { isUndefined } from './helpers/common-utils';
import {
  getConstructorParamsMetadata,
  getDesignParamtypesMetadata,
  getOptionalConstructorParamsMetadata,
  getOptionalPropertiesMetadata,
  getPropertiesMetadata
} from './helpers/metadata-utils';
import { InstanceWrapper, InstancePropertyMetadata } from './instance-wrapper';
import {
  ContextId,
  FuncType,
  InjectorDependencyContext,
  PropertyMetadata,
  ReferenceableToken,
  Type
} from './interfaces';
import { ModuleWrapper } from './module-wrapper';
import { resolveToken } from './helpers/token-utils';
import { isInjectorParamContext } from './helpers/injector-utils';


export interface PropertyDependency extends PropertyMetadata {
  isOptional?: boolean;
  instance?: unknown;
}

export class Injector {
  constructor(private readonly _initializationMode = false) {}

  loadProvider(
    wrapper: InstanceWrapper,
    module: ModuleWrapper,
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper
  ): Promise<void> {
    return this.loadInstance(
      wrapper,
      module,
      contextId,
      inquirer
    );
  }

  async loadInstance<T>(
    wrapper: InstanceWrapper<T>,
    module: ModuleWrapper,
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper
  ): Promise<void> {
    const instanceHost = wrapper.getInstanceByContextId(contextId, inquirer);
    if (instanceHost.donePromise) {
      return instanceHost.donePromise;
    }

    if (!module.providers.has(wrapper.token)) {
      throw new RuntimeError();
    }

    let done!: () => void;
    // eslint-disable-next-line no-return-assign
    instanceHost.donePromise = new Promise(resolve => (done = resolve));

    if (instanceHost.isResolved) {
      done();
      return;
    }

    const [isResolved, params] = await this.resolveConstructorParams(
      wrapper,
      module,
      contextId,
      wrapper
    );
    if (!isResolved) {
      return;
    }

    const properties = await this.resolveProperties(
      wrapper,
      module,
      contextId,
      wrapper
    );

    const instance = await this.instantiateClass(
      wrapper,
      params,
      contextId,
      inquirer
    );

    if (instance) {
      for (const property of properties) {
        (instance as Record<string | symbol, unknown>)[property.key] = property.instance;
      }

      if (wrapper.init) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        await (instance as any)[wrapper.init.key]();
      }
    }

    done();
  }

  async loadPerContext<T>(
    wrapper: InstanceWrapper<T>,
    module: ModuleWrapper,
    contextId: ContextId
  ): Promise<T | undefined> {
    await this.loadInstance(wrapper, module, contextId, wrapper);
    const host = wrapper.getInstanceByContextId(contextId, wrapper);
    return host.instance;
  }

  async resolveConstructorParams<T>(
    wrapper: InstanceWrapper<T>,
    module: ModuleWrapper,
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper
  ): Promise<[boolean, unknown[]]> {
    const metadata = wrapper.getCtorParamsMetadata();
    if (metadata && contextId !== STATIC_CONTEXT) {
      const instances = await this.loadConstructorParamsMetadata(
        metadata,
        module,
        contextId,
        inquirer
      );
      return [true, instances];
    }

    const params = wrapper.isNewable
      ? this.reflectConstructorParams(wrapper.metatype as Type<unknown>)
      : wrapper.inject!;
    const optionalParams = wrapper.isNewable
      ? this.reflectOptionalConstructorParams(wrapper.metatype as Type<unknown>)
      : [];

    let isResolved = true;
    const resolveParam = async (param: ReferenceableToken, index: number): Promise<unknown> => {
      try {
        const paramWrapper = await this.resolveSingleParam(
          wrapper,
          {
            token: resolveToken(param),
            index,
            params
          },
          module,
          contextId,
          inquirer
        );
        const instanceHost = paramWrapper.getInstanceByContextId(contextId, inquirer);
        if (!instanceHost.isResolved && !paramWrapper.isForwardRef) {
          isResolved = false;
        }
        return instanceHost.instance;
      } catch (e) {
        if (!optionalParams.includes(index)) {
          throw e;
        }
        return undefined;
      }
    };
    const instances = await Promise.all(params.map(resolveParam));
    return [isResolved, instances];
  }

  async resolveProperties<T>(
    wrapper: InstanceWrapper<T>,
    module: ModuleWrapper,
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper
  ): Promise<PropertyDependency[]> {
    if (!wrapper.isNewable) {
      return [];
    }

    const metadata = wrapper.getPropertiesMetadata();
    if (metadata && contextId !== STATIC_CONTEXT) {
      return this.loadPropertiesMetadata(
        metadata,
        module,
        contextId,
        inquirer
      );
    }

    const properties = this.reflectProperties(wrapper.metatype as Type<unknown>);

    const resolveProperty = async (prop: PropertyDependency): Promise<PropertyDependency> => {
      try {
        const paramWrapper = await this.resolveSingleParam(
          wrapper,
          {
            token: resolveToken(prop.token!),
            key: prop.key
          },
          module,
          contextId,
          inquirer
        );

        const instanceHost = paramWrapper.getInstanceByContextId(contextId, inquirer);
        prop.instance = instanceHost.instance;
      } catch (e) {
        if (!prop.isOptional) {
          throw e;
        }
      }

      return prop;
    };
    return Promise.all(properties.map(resolveProperty));
  }

  async loadConstructorParamsMetadata(
    metadata: InstanceWrapper[],
    module: ModuleWrapper,
    contextId: ContextId,
    inquirer?: InstanceWrapper
  ): Promise<unknown[]> {
    const resolveParam = async (param: InstanceWrapper): Promise<unknown> => {
      await this.resolveComponentHost(param.host || module, param, contextId, inquirer);
      return param.getInstanceByContextId(contextId, inquirer).instance;
    };
    return Promise.all(metadata.map(resolveParam));
  }

  async loadPropertiesMetadata(
    metadata: InstancePropertyMetadata[],
    module: ModuleWrapper,
    contextId: ContextId,
    inquirer?: InstanceWrapper
  ): Promise<PropertyDependency[]> {
    const resolveProperty = async ({ key, wrapper }: InstancePropertyMetadata): Promise<PropertyDependency> => {
      await this.resolveComponentHost(wrapper.host || module, wrapper, contextId, inquirer);
      return {
        key,
        token: wrapper.token,
        instance: wrapper.getInstanceByContextId(contextId, inquirer).instance
      };
    };
    return Promise.all(metadata.map(resolveProperty));
  }

  async resolveSingleParam(
    wrapper: InstanceWrapper,
    dependencyContext: InjectorDependencyContext,
    module: ModuleWrapper,
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper
  ): Promise<InstanceWrapper> {
    const token = dependencyContext.token;
    if (isUndefined(token)) {
      throw new UndefinedDependencyError(wrapper.name, dependencyContext);
    }
    if (wrapper.token === token) {
      throw new UnknownDependenciesError(wrapper.name, dependencyContext, module.metatype.name);
    }

    let instanceWrapper: InstanceWrapper | undefined;
    if (module.providers.has(token)) {
      instanceWrapper = module.providers.get(token)!;
      this.addDependencyMetadata(dependencyContext, wrapper, instanceWrapper);

    } else {
      instanceWrapper = await this.lookupComponentInImports(
        module,
        dependencyContext,
        wrapper,
        [module.id],
        contextId,
        inquirer
      );
      if (isUndefined(instanceWrapper)) {
        throw new UnknownDependenciesError(wrapper.name, dependencyContext, module.metatype.name);
      }
    }

    return this.resolveComponentHost(
      module,
      instanceWrapper,
      contextId,
      inquirer
    );
  }

  async resolveComponentHost<T>(
    module: ModuleWrapper,
    instanceWrapper: InstanceWrapper<T>,
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper
  ): Promise<InstanceWrapper<T>> {
    const instanceHost = instanceWrapper.getInstanceByContextId(contextId, inquirer);
    if (!instanceHost.isResolved) {
      if (!instanceWrapper.isForwardRef) {
        await this.loadProvider(instanceWrapper, module, contextId, inquirer);
      } else if (contextId !== STATIC_CONTEXT || inquirer) {
        if (instanceHost.donePromise) {
          void instanceHost.donePromise.then(() => this.loadProvider(instanceWrapper, module, contextId, inquirer));
        }
      }
    }

    if (instanceWrapper.isAsync) {
      const host = instanceWrapper.getInstanceByContextId(contextId, inquirer);
      host.instance = await (host.instance as Promise<T> | undefined);
      instanceWrapper.setInstanceByContextId(contextId, host, inquirer);
    }

    return instanceWrapper;
  }

  async lookupComponentInImports(
    module: ModuleWrapper,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper,
    moduleRegistry: string[] = [],
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper,
    isTraversing?: boolean
  ): Promise<InstanceWrapper | undefined> {
    const token = dependencyContext.token;

    let children = [...module.imports];
    if (isTraversing) {
      children = children.filter(it => module.exports.has(it.metatype));
    }

    for (const relatedModule of children) {
      if (moduleRegistry.includes(relatedModule.id)) {
        continue;
      }
      moduleRegistry.push(relatedModule.id);

      const { providers, exports } = relatedModule;
      if (exports.has(token) && providers.has(token)) {
        const instanceWrapper = providers.get(token)!;
        this.addDependencyMetadata(dependencyContext, wrapper, instanceWrapper);

        const instanceHost = instanceWrapper.getInstanceByContextId(contextId, inquirer);
        if (!instanceHost.isResolved && !instanceWrapper.isForwardRef) {
          await this.loadProvider(instanceWrapper, relatedModule, contextId, wrapper);
        }
        return instanceWrapper;

      } else {
        const instanceWrapper = await this.lookupComponentInImports(
          relatedModule,
          dependencyContext,
          wrapper,
          moduleRegistry,
          contextId,
          inquirer,
          true
        );
        if (instanceWrapper) {
          this.addDependencyMetadata(dependencyContext, wrapper, instanceWrapper);
          return instanceWrapper;
        }
      }
    }

    return undefined;
  }

  async instantiateClass<T>(
    wrapper: InstanceWrapper<T>,
    params: unknown[],
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper
  ): Promise<T | undefined> {
    const instanceHost = wrapper.getInstanceByContextId(contextId, inquirer);

    if (!this._initializationMode || wrapper.isDependencyTreeStatic()) {
      if (wrapper.isNewable) {
        const instance = new (wrapper.metatype as Type<T>)(...params);
        instanceHost.instance = wrapper.isForwardRef
          ? Object.assign(instanceHost.instance, instance)
          : instance;

      } else {
        instanceHost.instance = await (wrapper.metatype as FuncType<T>)(...params);
      }
    }

    instanceHost.isResolved = true;
    return instanceHost.instance;
  }

  reflectConstructorParams(type: Type<unknown>): ReferenceableToken[] {
    const paramtypes = [...(getDesignParamtypesMetadata<unknown[]>(type) || [])];
    const customParamtypes = getConstructorParamsMetadata(type) || [];
    for (const { index, token } of customParamtypes) {
      if (!isUndefined(token)) {
        paramtypes[index] = token;
      }
    }
    return paramtypes as ReferenceableToken[];
  }

  reflectOptionalConstructorParams(type: Type<unknown>): number[] {
    return getOptionalConstructorParamsMetadata(type) || [];
  }

  reflectProperties(type: Type<unknown>): PropertyDependency[] {
    const properties = getPropertiesMetadata(type) || [];
    const optionalKeys = getOptionalPropertiesMetadata(type) || [];
    return properties.map(prop => ({
      ...prop,
      isOptional: optionalKeys.includes(prop.key)
    }));
  }

  private addDependencyMetadata(
    dependencyContext: InjectorDependencyContext,
    hostWrapper: InstanceWrapper,
    instanceWrapper: InstanceWrapper
  ): void {
    if (isInjectorParamContext(dependencyContext)) {
      hostWrapper.addCtorParamsMetadata(dependencyContext.index, instanceWrapper);
    } else {
      hostWrapper.addPropertiesMetadata(dependencyContext.key, instanceWrapper);
    }
  }
}
