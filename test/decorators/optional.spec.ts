import { expect } from 'chai';
import {
  Inject,
  Optional,
  metadataUtils,
  UnsupportedDecoratorUsageError
} from '../../src';

describe('@Optional', () => {
  class Test {
    @Optional()
    @Inject('propFoo')
    foo: unknown;

    @Optional()
    @Inject('propBar')
    bar: unknown;

    constructor(
      @Optional() @Inject('paramA') _a: unknown,
      @Optional() @Inject('paramB') _b: unknown
    ) {}
  }

  it('should enhance class with expected optional metadata', () => {
    const params = metadataUtils.getOptionalConstructorParamsMetadata(Test);
    expect(params).to.deep.equal([1, 0]);

    const properties = metadataUtils.getOptionalPropertiesMetadata(Test);
    expect(properties).to.deep.equal(['foo', 'bar']);
  });

  it('when decorator apply to unsupported declaration should throw error', () => {
    expect(() => {
      // @ts-expect-error declared but never used
      class Test {
        foo(@Optional() _a: unknown): void {}
      }
    }).to.throw(UnsupportedDecoratorUsageError);
  });
});
