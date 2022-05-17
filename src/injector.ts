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
import { INQUIRER_KEY_OR_INDEX, INQUIRER_TYPE } from './inquirer';
import { Inquirer, InstancePerContext } from './instance-store';

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
    inquirer?: Inquirer
  ): Promise<void> {
    return this.loadInstance(
      wrapper,
      module,
      contextId,
      inquirer
    ) as unknown as Promise<void>;
  }

  async loadPerContext<T>(
    wrapper: InstanceWrapper<T>,
    module: ModuleWrapper,
    contextId: ContextId
  ): Promise<T | undefined> {
    const inquirer: Inquirer = {
      wrapper
    };
    const instanceHost = await this.loadInstance(wrapper, module, contextId, inquirer);
    return instanceHost.instance;
  }

  async loadInstance<T>(
    wrapper: InstanceWrapper<T>,
    module: ModuleWrapper,
    contextId = STATIC_CONTEXT,
    inquirer?: Inquirer,
    instanceHost?: InstancePerContext<T>
  ): Promise<InstancePerContext<T>> {
    if (!instanceHost) {
      instanceHost = wrapper.getInstanceByContextId(contextId, inquirer);
      if (instanceHost.donePromise) {
        await instanceHost.donePromise;
        return instanceHost;
      }
    }

    if (!module.providers.has(wrapper.token)) {
      throw new RuntimeError();
    }

    let done!: () => void;
    // eslint-disable-next-line no-return-assign
    instanceHost.donePromise = new Promise(resolve => (done = resolve));

    if (instanceHost.isResolved) {
      done();
      return instanceHost;
    }

    const [isResolved, params] = await this.resolveConstructorParams(
      wrapper,
      module,
      contextId,
      inquirer
    );
    if (!isResolved) {
      return instanceHost;
    }

    const properties = await this.resolveProperties(
      wrapper,
      module,
      contextId,
      inquirer
    );

    const instance = await this.instantiateClass(
      wrapper,
      params,
      contextId,
      inquirer,
      instanceHost
    );

    if (instance) {
      for (const property of properties) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (instance as any)[property.key] = property.instance;
      }

      if (wrapper.init) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        await (instance as any)[wrapper.init.key]();
      }
    }

    done();
    return instanceHost;
  }

  async resolveConstructorParams<T>(
    wrapper: InstanceWrapper<T>,
    module: ModuleWrapper,
    contextId = STATIC_CONTEXT,
    inquirer?: Inquirer
  ): Promise<[boolean, unknown[]]> {
    const metadata = wrapper.getCtorParamsMetadata();
    if (metadata && contextId !== STATIC_CONTEXT) {
      const instances = await this.loadConstructorParamsMetadata(
        wrapper,
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
        if (inquirer) {
          if (param === INQUIRER_TYPE) {
            return inquirer.wrapper.metatype;
          } else if (param === INQUIRER_KEY_OR_INDEX) {
            return inquirer.keyOrIndex;
          }
        }

        const [paramWrapper, instanceHost] = await this.resolveSingleParam(
          wrapper,
          {
            token: resolveToken(param),
            index,
            params
          },
          module,
          contextId,
          { wrapper, keyOrIndex: index }
        );
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
    inquirer?: Inquirer
  ): Promise<PropertyDependency[]> {
    if (!wrapper.isNewable) {
      return [];
    }

    const metadata = wrapper.getPropertiesMetadata();
    if (metadata && contextId !== STATIC_CONTEXT) {
      return this.loadPropertiesMetadata(
        wrapper,
        metadata,
        module,
        contextId,
        inquirer
      );
    }

    const properties = this.reflectProperties(wrapper.metatype as Type<unknown>);

    const resolveProperty = async (prop: PropertyDependency): Promise<PropertyDependency> => {
      try {
        if (inquirer) {
          if (prop.token === INQUIRER_TYPE) {
            prop.instance = inquirer.wrapper.metatype;
            return prop;
          } else if (prop.token === INQUIRER_KEY_OR_INDEX) {
            prop.instance = inquirer.keyOrIndex;
            return prop;
          }
        }

        const [, instanceHost] = await this.resolveSingleParam(
          wrapper,
          {
            token: resolveToken(prop.token!),
            key: prop.key
          },
          module,
          contextId,
          { wrapper, keyOrIndex: prop.key }
        );

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
    wrapper: InstanceWrapper,
    metadata: InstanceWrapper[],
    module: ModuleWrapper,
    contextId: ContextId,
    inquirer?: Inquirer
  ): Promise<unknown[]> {
    const resolveParam = async (param: InstanceWrapper, index: number): Promise<unknown> => {
      if (inquirer) {
        if (param.token === INQUIRER_TYPE) {
          return inquirer.wrapper.metatype;
        } else if (param.token === INQUIRER_KEY_OR_INDEX) {
          return inquirer.keyOrIndex;
        }
      }

      const instanceHost = await this.resolveComponentHost(
        param.host || module,
        param,
        contextId,
        { wrapper, keyOrIndex: index }
      );
      return instanceHost.instance;
    };
    return Promise.all(metadata.map(resolveParam));
  }

  async loadPropertiesMetadata(
    wrapper: InstanceWrapper,
    metadata: InstancePropertyMetadata[],
    module: ModuleWrapper,
    contextId: ContextId,
    inquirer?: Inquirer
  ): Promise<PropertyDependency[]> {
    const resolveProperty = async ({ key, wrapper: keyWrapper }: InstancePropertyMetadata): Promise<PropertyDependency> => {
      if (inquirer) {
        if (keyWrapper.token === INQUIRER_TYPE) {
          return {
            key,
            token: keyWrapper.token,
            instance: inquirer.wrapper.metatype
          };
        } else if (keyWrapper.token === INQUIRER_KEY_OR_INDEX) {
          return {
            key,
            token: keyWrapper.token,
            instance: inquirer.keyOrIndex
          };
        }
      }

      const instanceHost = await this.resolveComponentHost(
        keyWrapper.host || module,
        keyWrapper,
        contextId,
        { wrapper, keyOrIndex: key }
      );
      return {
        key,
        token: keyWrapper.token,
        instance: instanceHost.instance
      };
    };
    return Promise.all(metadata.map(resolveProperty));
  }

  async resolveSingleParam<T>(
    wrapper: InstanceWrapper,
    dependencyContext: InjectorDependencyContext,
    module: ModuleWrapper,
    contextId = STATIC_CONTEXT,
    inquirer?: Inquirer
  ): Promise<[InstanceWrapper<T>, InstancePerContext<T>]> {
    const token = dependencyContext.token;
    if (isUndefined(token)) {
      throw new UndefinedDependencyError(wrapper.name, dependencyContext);
    }
    if (wrapper.token === token) {
      throw new UnknownDependenciesError(wrapper.name, dependencyContext, module.metatype.name);
    }

    let instanceWrapper: InstanceWrapper<T> | undefined;
    if (module.providers.has(token)) {
      instanceWrapper = module.providers.get(token)! as InstanceWrapper<T>;
      this.addDependencyMetadata(dependencyContext, wrapper, instanceWrapper);

    } else {
      const component = await this.lookupComponentInImports<T>(
        module,
        dependencyContext,
        wrapper,
        [module.id]
      );
      if (isUndefined(component)) {
        throw new UnknownDependenciesError(wrapper.name, dependencyContext, module.metatype.name);
      }
      [instanceWrapper, module] = component;
    }

    const instanceHost = await this.resolveComponentHost(
      module,
      instanceWrapper,
      contextId,
      inquirer
    );
    return [instanceWrapper, instanceHost];
  }

  async resolveComponentHost<T>(
    module: ModuleWrapper,
    instanceWrapper: InstanceWrapper<T>,
    contextId = STATIC_CONTEXT,
    inquirer?: Inquirer
  ): Promise<InstancePerContext<T>> {
    const instanceHost = instanceWrapper.getInstanceByContextId(contextId, inquirer);
    if (!instanceHost.isResolved && !instanceWrapper.isForwardRef) {
      await this.loadInstance(instanceWrapper, module, contextId, inquirer, instanceHost);
    }

    if (instanceWrapper.isAsync) {
      instanceHost.instance = await (instanceHost.instance as Promise<T> | undefined);
    }

    return instanceHost;
  }

  async lookupComponentInImports<T>(
    module: ModuleWrapper,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper,
    moduleRegistry: string[] = [],
    isTraversing?: boolean
  ): Promise<[InstanceWrapper<T>, ModuleWrapper] | undefined> {
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
        const instanceWrapper = providers.get(token)! as InstanceWrapper<T>;
        this.addDependencyMetadata(dependencyContext, wrapper, instanceWrapper);
        return [instanceWrapper, relatedModule];

      } else {
        const component = await this.lookupComponentInImports<T>(
          relatedModule,
          dependencyContext,
          wrapper,
          moduleRegistry,
          true
        );
        if (component) {
          this.addDependencyMetadata(dependencyContext, wrapper, component[0]);
          return component;
        }
      }
    }

    return undefined;
  }

  async instantiateClass<T>(
    wrapper: InstanceWrapper<T>,
    params: unknown[],
    contextId = STATIC_CONTEXT,
    inquirer?: Inquirer,
    instanceHost?: InstancePerContext<T>
  ): Promise<T | undefined> {
    if (!instanceHost) {
      instanceHost = wrapper.getInstanceByContextId(contextId, inquirer);
    }

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
