import {
  CircularDependencyError,
  UndefinedModuleError,
  UnknownModuleError
} from './errors';
import {
  Type,
  DynamicModuleMetadata,
  Provider,
  ExportedComponent,
  DynamicModule
} from './interfaces';
import { ModuleCompiler } from './module-compiler';
import { ModuleTokenFactory } from './module-token-factory';
import { ModuleWrapper } from './module-wrapper';
import { getGlobalMetadata } from './helpers/metadata-utils';
import { isUndefined } from './helpers/common-utils';

export class Container {
  private readonly _moduleTokenFactory = new ModuleTokenFactory();
  private readonly _moduleComplier = new ModuleCompiler(this._moduleTokenFactory);
  private readonly _modules = new Map<string, ModuleWrapper>();
  private readonly _globalModules = new Set<ModuleWrapper>();
  private _internalCoreModule?: ModuleWrapper;

  get modules(): Map<string, ModuleWrapper> {
    return this._modules;
  }

  get internalCoreModule(): ModuleWrapper | undefined {
    return this._internalCoreModule;
  }

  registerCoreModule(module: ModuleWrapper): void {
    this._internalCoreModule = module;
  }

  addModule(
    rawModule: Type<unknown> | DynamicModule,
    scope?: string[]
  ): ModuleWrapper | undefined {
    if (isUndefined(rawModule)) {
      throw new UndefinedModuleError(scope);
    }

    const { metatype, dynamicMetadata, id } = this._moduleComplier.compile(rawModule);

    if (this._modules.has(id)) {
      return;
    }

    const module = new ModuleWrapper(id, metatype, dynamicMetadata, this);
    this._modules.set(id, module);

    if (this.isGlobalModule(metatype, dynamicMetadata)) {
      this.addGlobalModule(module);
    }

    return module;
  }

  findModule(predicate: (module: ModuleWrapper) => boolean): ModuleWrapper | undefined {
    return [...this._modules.values()].find(predicate);
  }

  isGlobalModule(metatype: Type<unknown>, dynamicMetadata?: DynamicModuleMetadata): boolean {
    return dynamicMetadata?.global || !!getGlobalMetadata(metatype);
  }

  addGlobalModule(module: ModuleWrapper): void {
    if (!this._modules.has(module.id)) {
      throw new UnknownModuleError(module.metatype.name);
    }

    this._globalModules.add(module);
  }

  clear(): void {
    this._modules.clear();
    this._globalModules.clear();
  }

  addImport(relatedRawModule: Type<unknown> | DynamicModule, targetModule: ModuleWrapper): void {
    if (isUndefined(relatedRawModule)) {
      throw new CircularDependencyError(targetModule.metatype.name);
    }

    if (!this._modules.has(targetModule.id)) {
      throw new UnknownModuleError(targetModule.metatype.name);
    }

    const { id } = this._moduleComplier.compile(relatedRawModule);
    const related = this.modules.get(id)!;
    targetModule.addRelatedModule(related);
  }

  addProvider(provider: Provider, module: ModuleWrapper): void {
    if (isUndefined(provider)) {
      throw new CircularDependencyError(module.metatype.name);
    }

    if (!this._modules.has(module.id)) {
      throw new UnknownModuleError(module.metatype.name);
    }

    module.addProvider(provider);
  }

  addExport(component: ExportedComponent, module: ModuleWrapper): Promise<void> {
    if (!this._modules.has(module.id)) {
      throw new UnknownModuleError(module.metatype.name);
    }

    return module.addExportedComponent(component);
  }

  bindGlobalModules(): void {
    this._modules.forEach((targetModule) => {
      if (targetModule === this._internalCoreModule) {
        return;
      }

      for (const globalModule of this._globalModules) {
        if (targetModule === globalModule) {
          continue;
        }
        targetModule.addRelatedModule(globalModule);
      }
    });
  }
}
