import { expect } from 'chai';
import { Global, metadataUtils } from '../../src';

describe('@Global', () => {
  @Global()
  class Test {}

  it('should enhance class with expected global metadata', () => {
    const isGlobal = metadataUtils.getGlobalMetadata(Test);

    expect(isGlobal).to.be.true;
  });
});
