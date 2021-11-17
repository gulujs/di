import { expect } from 'chai';
import {
  InstanceLoader,
  Container,
  DependenciesScanner
} from '../../src';
import { MainModule } from '../fixtures/samples/04-circular-dependency-params/correct/main.module';

describe('04-circular-dependency-params', () => {
  it('incorrect: should throw UndefinedDependencyError', async () => {
    let err: unknown;
    try {
      const { MainModule } = await import('../fixtures/samples/04-circular-dependency-params/incorrect/main.module');

      const container = new Container();
      const scanner = new DependenciesScanner(container);
      await scanner.scan(MainModule);
      const instanceLoader = new InstanceLoader(container);
      await instanceLoader.createInstancesOfDependencies();
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

    const [mainModule] = container.modules.values();
    const providers = [...mainModule!.providers.values()];
    const oneServiceWrapper = providers[2];
    const twoServiceWrapper = providers[3];

    expect(oneServiceWrapper!.getCtorParamsMetadata()).to.include(twoServiceWrapper);
    expect(twoServiceWrapper!.getCtorParamsMetadata()).to.include(oneServiceWrapper);
  });
});
