import { expect } from 'chai';
import {
  Container,
  DependenciesScanner,
  InstanceLoader,
  InstanceWrapper
} from '../../src';
import { MainModule } from '../fixtures/samples/03-circular-dependency-providers/correct/main.module';

describe('03-circular-dependency-providers', () => {
  it('incorrect: should throw ReferenceError', async () => {
    let err: unknown;
    try {
      const { MainModule } = await import('../fixtures/samples/03-circular-dependency-providers/incorrect/main.module');

      const container = new Container();
      const scanner = new DependenciesScanner(container);
      await scanner.scan(MainModule);
    } catch (e) {
      err = e;
    }
    expect(err).to.be.an.instanceof(ReferenceError);
  });

  it('correct', async () => {
    const container = new Container();
    const scanner = new DependenciesScanner(container);
    await scanner.scan(MainModule);
    const instanceLoader = new InstanceLoader(container);
    await instanceLoader.createInstancesOfDependencies();

    const [mainModule, childModule] = container.modules.values();
    expect(mainModule?.imports.has(childModule!)).to.be.true;
    const childModuleProviders = [...childModule!.providers.values()];
    const childModuleWrapper: InstanceWrapper = childModuleProviders[0]!;
    const oneServiceWrapper: InstanceWrapper = childModuleProviders[2]!;
    expect(oneServiceWrapper.getCtorParamsMetadata()).to.include(childModuleWrapper);
  });
});
