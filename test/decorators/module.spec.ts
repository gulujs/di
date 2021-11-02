import { expect } from 'chai';
import { Injectable, metadataUtils, Module } from '../../src';

describe('@Module', () => {
  @Module({})
  class Foo {}

  @Injectable()
  class Bar {}

  @Module({
    imports: [Foo],
    scanPaths: ['/scan/path'],
    providers: [Bar],
    exports: [Foo, Bar]
  })
  class Test {}

  it('should enhance class with expected module metadata', () => {
    const imports = metadataUtils.getModuleImportsMetadata(Test);
    expect(imports).to.deep.equal([Foo]);

    const scanPaths = metadataUtils.getModuleProvidersScanPathsMetadata(Test);
    expect(scanPaths).to.deep.equal(['/scan/path']);

    const providers = metadataUtils.getModuleProvidersMetadata(Test);
    expect(providers).to.deep.equal([Bar]);

    const exports = metadataUtils.getModuleExportsMetadata(Test);
    expect(exports).to.deep.equal([Foo, Bar]);
  });
});
