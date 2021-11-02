import { expect } from 'chai';
import { DynamicModule, ModuleCompiler } from '../src';

describe('ModuleCompiler', () => {
  let compiler: ModuleCompiler;
  beforeEach(() => {
    compiler = new ModuleCompiler();
  });

  describe('extractMetadata', () => {
    describe('when module is a dynamic module', () => {
      it('should return object with "metatype" and "dynamicMetadata" property', () => {
        const module: DynamicModule = {
          module: class {},
          providers: []
        };
        const { module: metatype, ...dynamicMetadata } = module;
        expect(compiler.extractMetadata(module))
          .to.deep.equal({ metatype, dynamicMetadata });
      });
    });

    describe('when module is not a dynamic module', () => {
      it('should return object with "metatype" property', () => {
        class TestModule {}
        expect(compiler.extractMetadata(TestModule))
          .to.deep.equal({ metatype: TestModule });
      });
    });
  });
});
