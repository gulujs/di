import { expect } from 'chai';
import { Init, metadataUtils } from '../../src';

describe('@Init', () => {
  class Test {
    @Init()
    init(): void {}
  }

  it('should enhance class with expected init metadata', () => {
    const init = metadataUtils.getInitMetadata(Test);

    expect(init).to.deep.equal({ key: 'init' });
  });
});
