import {
  ClassProvider,
  CustomProvider,
  FactoryProvider,
  Provider,
  AliasProvider,
  Type,
  ValueProvider
} from '../interfaces';
import { isFunction, isUndefined } from './common-utils';
import { getInjectableMetadata } from './metadata-utils';

export function isCustomProvider(provider: Provider): provider is CustomProvider {
  return !isUndefined((provider as CustomProvider).token);
}

export function isClassProvider(provider: Provider): provider is ClassProvider {
  return !isUndefined((provider as ClassProvider).useClass);
}

export function isValueProvider(provider: Provider): provider is ValueProvider {
  return !isUndefined((provider as ValueProvider).useValue);
}

export function isFactoryProvider(provider: Provider): provider is FactoryProvider {
  return !isUndefined((provider as FactoryProvider).useFactory);
}

export function isAliasProvider(provider: Provider): provider is AliasProvider {
  return !isUndefined((provider as AliasProvider).useToken);
}

export function isProvider(provider: unknown): provider is Provider {
  return (
    isFunction(provider)
    && getInjectableMetadata(provider as Type<unknown>)
  )
  || (
    isCustomProvider(provider as Provider)
    && (
      isClassProvider(provider as Provider)
      || isFactoryProvider(provider as Provider)
      || isValueProvider(provider as Provider)
      || isAliasProvider(provider as Provider)
    )
  );
}
