import { Abstract, Token, Type } from './interfaces';
import { Container } from './container';
import { InstanceWrapper } from './instance-wrapper';
import { ModuleWrapper } from './module-wrapper';
import { isFunction, isString } from './helpers/common-utils';
import { UnknownElementError, UnknownModuleError } from './errors';
import { stringifyToken } from './helpers/token-utils';


export interface InstanceLink<T = unknown> {
  token: Token;
  wrapper: InstanceWrapper<T>;
  module: ModuleWrapper;
}

export enum SearchScope {
  ModuleOnly,
  ModuleAndImports,
  Container
}

type InstanceLinksMap = Map<Token, InstanceLink[]>;

interface InstanceLinksJar {
  instanceLinks: InstanceLinksMap;
  tokensMap: Map<string, Array<Type<unknown> | Abstract<unknown>>>;
}


const CONTAINER_ID = Symbol('@lunjs/di:CONTAINER_ID');


export class InstanceLinksHost {
  private readonly _instanceLinksJarMap = new Map<string | symbol, InstanceLinksJar>();

  constructor(private readonly _container: Container) {}

  get<T = unknown>(token: Token, module: ModuleWrapper, scope: SearchScope, allowSearchByName: boolean): InstanceLink<T> {
    if (scope === SearchScope.ModuleAndImports) {
      const jar = this.getInstanceLinksJarByModule(module);
      return this.search(token, jar, allowSearchByName);

    } else if (scope === SearchScope.Container) {
      const jar = this.getInstanceLinksJarByContainer();
      return this.search(token, jar, allowSearchByName);

    } else {
      return this.searchInModuleOnly<T>(token, module, allowSearchByName);
    }
  }

  private getInstanceLinksJarByModule(module: ModuleWrapper): InstanceLinksJar {
    let jar = this._instanceLinksJarMap.get(module.id);
    if (!jar) {
      if (!this._container.modules.has(module.id)) {
        throw new UnknownModuleError(module.metatype.name);
      }

      jar = {
        instanceLinks: new Map(),
        tokensMap: new Map()
      };
      this._instanceLinksJarMap.set(module.id, jar);

      module.providers.forEach((wrapper, token) => this.addLink(wrapper, token, module, jar!));
      this.collectInstanceLinkFromImports(module, jar, [module.id]);
    }
    return jar;
  }

  private collectInstanceLinkFromImports(
    module: ModuleWrapper,
    jar: InstanceLinksJar,
    moduleRegistry: string[] = [],
    isTraversing?: boolean
  ): void {
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
      for (const token of exports) {
        if (providers.has(token)) {
          this.addLink(providers.get(token)!, token, relatedModule, jar);
        }
      }

      this.collectInstanceLinkFromImports(relatedModule, jar, moduleRegistry, true);
    }
  }

  private addLink(
    wrapper: InstanceWrapper,
    token: Token,
    module: ModuleWrapper,
    data: InstanceLinksJar
  ): void {
    const instanceLink: InstanceLink = {
      module,
      wrapper,
      token
    };

    const existingLinks = data.instanceLinks.get(token);
    if (!existingLinks) {
      data.instanceLinks.set(token, [instanceLink]);
    } else {
      existingLinks.push(instanceLink);
    }

    if (isFunction(token) && token.name) {
      const existingTokens = data.tokensMap.get(token.name);
      if (!existingTokens) {
        data.tokensMap.set(token.name, [token]);
      } else {
        existingTokens.push(token);
      }
    }
  }

  private getInstanceLinksJarByContainer(): InstanceLinksJar {
    let data = this._instanceLinksJarMap.get(CONTAINER_ID);
    if (!data) {
      data = {
        instanceLinks: new Map(),
        tokensMap: new Map()
      };
      this._instanceLinksJarMap.set(CONTAINER_ID, data);

      [...this._container.modules.values()]
        .sort((a, b) => a.distance - b.distance)
        .forEach((module) => {
          module.providers.forEach((wrapper, token) => {
            this.addLink(wrapper, token, module, data!);
          });
        });
    }
    return data;
  }

  private search<T>(token: Token, jar: InstanceLinksJar, allowSearchByName: boolean): InstanceLink<T> {
    let instanceLink = jar.instanceLinks.get(token);

    if (!instanceLink && allowSearchByName && isString(token)) {
      const types = jar.tokensMap.get(token);
      if (types) {
        instanceLink = jar.instanceLinks.get(types[0]!);
      }
    }

    if (!instanceLink) {
      throw new UnknownElementError(stringifyToken(token));
    }

    return instanceLink[0]! as InstanceLink<T>;
  }

  private searchInModuleOnly<T>(token: Token, module: ModuleWrapper, allowSearchByName: boolean): InstanceLink<T> {
    if (!this._container.modules.has(module.id)) {
      throw new UnknownModuleError(module.metatype.name);
    }

    let wrapper = module.providers.get(token);

    if (!wrapper && allowSearchByName && isString(token)) {
      for (const [type, provider] of module.providers) {
        if (!isFunction(type) || !type.name) {
          continue;
        }
        if (type.name === token) {
          wrapper = provider;
          break;
        }
      }
    }

    if (!wrapper) {
      throw new UnknownElementError(stringifyToken(token));
    }

    return {
      token,
      wrapper: wrapper as InstanceWrapper<T>,
      module
    };
  }
}
