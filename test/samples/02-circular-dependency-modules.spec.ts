import { expect } from 'chai';
import { Container, DependenciesScanner } from '../../src';
import { MainModule } from '../fixtures/samples/02-circular-dependency-modules/correct/main.module';

describe('02-circular-dependency-modules', () => {
  it('incorrect: should throw ReferenceError', async () => {
    let err: unknown;
    try {
      const { MainModule } = await import('../fixtures/samples/02-circular-dependency-modules/incorrect/main.module');

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

    const [mainModule, oneModule, twoModule] = container.modules.values();
    expect(mainModule!.imports.has(oneModule!)).to.be.true;
    expect(oneModule!.imports.has(twoModule!)).to.be.true;
    expect(twoModule!.imports.has(oneModule!)).to.be.true;
  });
});
