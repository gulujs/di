import { expect } from 'chai';
import {
  Inject,
  metadataUtils,
  UnsupportedDecoratorUsageError
} from '../../src';

describe('@Inject', () => {
  class Test {
    @Inject('propFoo')
    foo: unknown;

    @Inject('propBar')
    bar: unknown;

    constructor(
      @Inject('paramA') _a: unknown,
      @Inject('paramB') _b: unknown
    ) {}
  }

  it('should enhance class with expected constructor params metadata', () => {
    const constructorParamsMetadata = metadataUtils.getConstructorParamsMetadata(Test);

    expect(constructorParamsMetadata).to.deep.equal([
      { index: 1, token: 'paramB' },
      { index: 0, token: 'paramA' }
    ]);
  });

  it('should enhance class with expected properties metadata', () => {
    const propertiesMetadata = metadataUtils.getPropertiesMetadata(Test);

    expect(propertiesMetadata).to.deep.equal([
      { key: 'foo', token: 'propFoo' },
      { key: 'bar', token: 'propBar' }
    ]);
  });

  it('when decorator apply to unsupported declaration should throw error', () => {
    expect(() => {
      // @ts-expect-error declared but never used
      class Test {
        foo(@Inject('paramA') _a: unknown): void {}
      }
    }).to.throw(UnsupportedDecoratorUsageError);
  });
});
