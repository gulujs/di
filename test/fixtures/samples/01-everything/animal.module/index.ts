import * as Path from 'path';
import { DynamicModule, Module, Provider } from '../../../../../src';
import { BirdService } from './services/bird.service';
import { CatService } from './services/cat.service';

@Module({
  scanPaths: [Path.dirname(import.meta.url)],
  exports: [CatService, BirdService]
})
export class AnimalModule {
  static forRoot(providers: Provider[] = []): DynamicModule {
    return {
      module: AnimalModule,
      providers
    };
  }
}
