import { Global, Module } from './decorators';
import { isCustomProvider } from './helpers/provider-utils';
import { DynamicModule, Provider } from './interfaces';
import { requestProvider } from './request';

@Global()
@Module({
  providers: [requestProvider],
  exports: [requestProvider]
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
