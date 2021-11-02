import { expect } from 'chai';
import {
  InstanceLoader,
  Container,
  DependenciesScanner,
  UndefinedDependencyError
} from '../../src';
import { MainModule } from '../fixtures/samples/04-circular-dependency-params/main.module';

describe('04-circular-dependency-params', () => {
  it('should throw UndefinedDependencyError', async () => {
    const container = new Container();
    const scanner = new DependenciesScanner(container);

    await scanner.scan(MainModule);

    let err: unknown;
    try {
      const instanceLoader = new InstanceLoader(container);
      await instanceLoader.createInstancesOfDependencies();
    } catch (e) {
      err = e;
    }
    expect(err).to.be.an.instanceof(UndefinedDependencyError);
  });
});
