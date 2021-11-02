import { expect } from 'chai';
import { metadataUtils, Scope } from '../../src';
import { ScopeEnum } from '../../src/scope-enum';

describe('@Scope', () => {
  @Scope(ScopeEnum.Transient)
  class Test {}

  it('should enhance class with expected scope metadata', () => {
    const scope = metadataUtils.getScopeMetadata(Test);

    expect(scope).to.equal(ScopeEnum.Transient);
  });
});
