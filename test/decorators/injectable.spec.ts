import { expect } from 'chai';
import { Injectable, metadataUtils } from '../../src';

describe('@Injectable', () => {
  @Injectable()
  class Test {}

  it('should enhance class with expected injectable metadata', () => {
    const isInjectable = metadataUtils.getInjectableMetadata(Test);

    expect(isInjectable).to.be.true;
  });
});
