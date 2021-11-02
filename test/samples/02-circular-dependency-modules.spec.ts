import { expect } from 'chai';
import { Container, DependenciesScanner, UndefinedModuleError } from '../../src';
import { MainModule } from '../fixtures/samples/02-circular-dependency-modules/main.module';

describe('02-circular-dependency-modules', () => {
  it('should throw UndefinedModuleError', async () => {
    const container = new Container();
    const scanner = new DependenciesScanner(container);

    let err: unknown;
    try {
      await scanner.scan(MainModule);
    } catch (e) {
      err = e;
    }
    expect(err).to.be.an.instanceof(UndefinedModuleError);
  });
});
