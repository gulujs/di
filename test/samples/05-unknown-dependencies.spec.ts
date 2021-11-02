import { expect } from 'chai';
import {
  DependenciesScanner,
  InstanceLoader,
  Container,
  UnknownDependenciesError
} from '../../src';
import { MainModule } from '../fixtures/samples/05-unknown-dependencies/main.module';

describe('05-unknown-dependencies', () => {
  it('should throw UnknownDependenciesError', async () => {
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
    expect(err).to.be.an.instanceof(UnknownDependenciesError);
  });
});
