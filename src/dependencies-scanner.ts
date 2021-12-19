import { pathToFileURL } from 'url';
import { readdirp } from '@lunjs/readdirp';
import { SCANNER_FILE_FILTER } from './constants';
import {
  ExportedComponent,
  Provider,
  RawModule,
  Type
} from './interfaces';
import { Container } from './container';
import { ModuleWrapper } from './module-wrapper';
import { UndefinedModuleError } from './errors';
import {
  getModuleExportsMetadata,
  getModuleImportsMetadata,
  getModuleProvidersMetadata,
  getModuleProvidersScanPathsMetadata
} from './helpers/metadata-utils';
import { isProvider } from './helpers/provider-utils';
import { isUndefined } from './helpers/common-utils';
import { isForwardReference } from './helpers/forward-reference-utils';

export class DependenciesScanner {
  constructor(private readonly _container: Container) {}

  async registerCoreModule(coreRawModule: RawModule): Promise<void> {
    const [module] = await this.scan(coreRawModule);
    if (module) {
      this._container.registerCoreModule(module);
    }
  }

  async scan(rawModule: RawModule): Promise<ModuleWrapper[]> {
    const modules = await this.scanForModules(rawModule);
    await this.scanModulesForDependencies(modules);
    this.calculateModulesDistance();

    this._container.bindGlobalModules();
    return modules;
  }

  async scanForModules(
    rawModule: RawModule,
    scope: string[] = [],
    rawModuleRegistry: RawModule[] = []
  ): Promise<ModuleWrapper[]> {
    const module = await this.insertModule(rawModule, scope);
    if (!module) {
      return [];
    }

    rawModuleRegistry.push(rawModule);

    const importsRawModules = this.getImportsRawModules(module);
    let registeredModules: ModuleWrapper[] = [module];

    for (const [index, importedRawModule] of importsRawModules.entries()) {
      if (isUndefined(importedRawModule)) {
        throw new UndefinedModuleError(scope, module.metatype.name, index);
      }
      if (rawModuleRegistry.includes(importedRawModule)) {
        continue;
      }
      const modules = await this.scanForModules(
        importedRawModule,
        [...scope, module.metatype.name],
        rawModuleRegistry
      );
      registeredModules = registeredModules.concat(modules);
    }

    return registeredModules;
  }

  async scanModulesForDependencies(modules?: Iterable<ModuleWrapper>): Promise<void> {
    if (!modules) {
      modules = this._container.modules.values();
    }
    for (const module of modules) {
      await this.reflectImports(module);
      await this.reflectProviders(module);
      await this.reflectExports(module);
    }
  }

  calculateModulesDistance(): void {
    const modulesStack: ModuleWrapper[] = [];

    const calculateDistance = (module: ModuleWrapper, distance: number): number => {
      if (modulesStack.includes(module)) {
        return -1;
      }
      modulesStack.push(module);

      if (module.imports.size === 0) {
        return -1;
      }

      let maxDistance = distance;
      for (const importedModule of module.imports) {
        importedModule.distance = distance;
        const deepDistance = calculateDistance(importedModule, distance + 1);
        if (deepDistance > maxDistance) {
          maxDistance = deepDistance;
        }
      }
      return maxDistance;
    };

    let nextDistance = 1;
    this._container.modules.forEach((module) => {
      const deepDistance = calculateDistance(module, nextDistance);
      if (deepDistance > 0) {
        nextDistance = deepDistance + 1;
      }
    });
  }

  async reflectImports(module: ModuleWrapper): Promise<void> {
    const imports = this.getImportsRawModules(module);
    await Promise.all(imports.map(related => this.insertImport(related, module)));
  }

  async reflectProviders(module: ModuleWrapper): Promise<void> {
    await this.reflectProvidersFromScanPaths(module);

    const providers = this.getProviders(module);
    for (const provider of providers) {
      this.insertProvider(provider, module);
    }
  }

  async reflectProvidersFromScanPaths(module: ModuleWrapper): Promise<void> {
    const scanPaths = this.getProvidersScanPaths(module);

    for (const path of scanPaths) {
      for await (const file of readdirp(path, { type: 'files', fileFilter: SCANNER_FILE_FILTER })) {
        const m = await import(pathToFileURL(file.fullPath).toString()) as unknown;
        if (!m || typeof m !== 'object') {
          continue;
        }

        for (const target of Object.values(m)) {
          if (isProvider(target)) {
            this.insertProvider(target as Type<unknown>, module);
          }
        }
      }
    }
  }

  async reflectExports(module: ModuleWrapper): Promise<void> {
    const exports = this.getExportsComponents(module);
    await Promise.all(exports.map(component => this.insertExport(component, module)));
  }

  async insertModule(rawModule: RawModule, scope: string[]): Promise<ModuleWrapper | undefined> {
    if (!isUndefined(rawModule) && isForwardReference(rawModule)) {
      rawModule = rawModule.forwardRef();
    }
    rawModule = await rawModule;
    return this._container.addModule(rawModule, scope);
  }

  async insertImport(relatedRawModule: RawModule, module: ModuleWrapper): Promise<void> {
    if (!isUndefined(relatedRawModule) && isForwardReference(relatedRawModule)) {
      relatedRawModule = relatedRawModule.forwardRef();
    }
    relatedRawModule = await relatedRawModule;
    this._container.addImport(relatedRawModule, module);
  }

  insertProvider(provider: Provider, module: ModuleWrapper): void {
    this._container.addProvider(provider, module);
  }

  insertExport(component: ExportedComponent, module: ModuleWrapper): Promise<void> {
    return this._container.addExport(component, module);
  }

  getImportsRawModules(module: ModuleWrapper): RawModule[] {
    return [
      ...(getModuleImportsMetadata(module.metatype) || []),
      ...(module.dynamicMetadata?.imports || [])
    ];
  }

  getProvidersScanPaths(module: ModuleWrapper): string[] {
    return [
      ...(getModuleProvidersScanPathsMetadata(module.metatype) || []),
      ...(module.dynamicMetadata?.scanPaths || [])
    ];
  }

  getProviders(module: ModuleWrapper): Provider[] {
    return [
      ...(getModuleProvidersMetadata(module.metatype) || []),
      ...(module.dynamicMetadata?.providers || [])
    ];
  }

  getExportsComponents(module: ModuleWrapper): ExportedComponent[] {
    return [
      ...(getModuleExportsMetadata(module.metatype) || []),
      ...(module.dynamicMetadata?.exports || [])
    ];
  }
}
