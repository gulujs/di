import { expect } from 'chai';
import { CircularDependencyError, Container, DependenciesScanner } from '../../src';
import { MainModule } from '../fixtures/samples/03-circular-dependency-providers/main.module';

describe('03-circular-dependency-providers', () => {
  it('should throw CircularDependencyError', async () => {
    const container = new Container();
    const scanner = new DependenciesScanner(container);

    let err: unknown;
    try {
      await scanner.scan(MainModule);
    } catch (e) {
      err = e;
    }
    expect(err).to.be.an.instanceof(CircularDependencyError);
  });
});
