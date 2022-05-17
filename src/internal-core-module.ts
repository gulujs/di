import { Global, Module } from './decorators';
import { isCustomProvider } from './helpers/provider-utils';
import { inquirerKeyOrIndexProvider, inquirerTypeProvider } from './inquirer';
import { DynamicModule, Provider } from './interfaces';

@Global()
@Module({
  providers: [
    inquirerTypeProvider,
    inquirerKeyOrIndexProvider
  ],
  exports: [
    inquirerTypeProvider,
    inquirerKeyOrIndexProvider
  ]
})
export class InternalCoreModule {
  static register(providers: Provider[]): DynamicModule {
    return {
      module: InternalCoreModule,
      providers: [...providers],
      exports: [...providers.map(it => (isCustomProvider(it) ? it.token : it))]
    };
  }
}
