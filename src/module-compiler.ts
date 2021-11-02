import { isDynamicModule } from './helpers/module-utils';
import {
  Type,
  DynamicModule,
  BasicModule
} from './interfaces';
import { ModuleTokenFactory } from './module-token-factory';

export class ModuleCompiler {
  constructor(private readonly _moduleTokenFactory = new ModuleTokenFactory()) {}

  compile(module: Type<unknown> | DynamicModule): BasicModule {
    const { metatype, dynamicMetadata } = this.extractMetadata(module);
    const id = this._moduleTokenFactory.create(metatype, dynamicMetadata);
    return {
      id,
      metatype,
      dynamicMetadata
    };
  }

  extractMetadata(module: Type<unknown> | DynamicModule): Omit<BasicModule, 'id'> {
    if (!isDynamicModule(module)) {
      return { metatype: module };
    }

    const { module: metatype, ...dynamicMetadata } = module;
    return { metatype, dynamicMetadata };
  }
}
