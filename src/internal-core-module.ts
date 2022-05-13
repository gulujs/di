import { Global, Module } from './decorators';
import { isCustomProvider } from './helpers/provider-utils';
import { inquirerKeyOrIndexProvider, inquirerTypeProvider } from './inquirer';
import { DynamicModule, Provider } from './interfaces';
import { requestProvider } from './request';


@Global()
@Module({
  providers: [
    requestProvider,
    inquirerTypeProvider,
    inquirerKeyOrIndexProvider
  ],
  exports: [
    requestProvider,
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
