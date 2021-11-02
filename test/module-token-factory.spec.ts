import { expect } from 'chai';
import * as sinon from 'sinon';
import hash from 'object-hash';
import stringify from 'fast-safe-stringify';
import { DynamicModuleMetadata, ModuleTokenFactory } from '../src';
import { TypeIdFactory } from '../src/type-id-factory';

describe('ModuleTokenFactory', () => {
  const moduleId = 'constId';
  let factory: ModuleTokenFactory;

  beforeEach(() => {
    factory = new ModuleTokenFactory();
  });

  describe('create', () => {
    class TestModule {}

    beforeEach(() => {
      sinon.stub(TypeIdFactory, 'get').withArgs(TestModule).returns(moduleId);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return expected token', () => {
      const token = factory.create(TestModule, undefined);
      const opaqueToken = {
        id: moduleId,
        module: TestModule.name,
        dynamic: ''
      };
      expect(token).to.equal(hash(opaqueToken));
    });

    it('should include dynamic metadata', () => {
      const dynamicMetadata: DynamicModuleMetadata = {
        providers: [{ token: 'foo', useValue: 'bar' }]
      };
      const token = factory.create(TestModule, dynamicMetadata);
      const opaqueToken = {
        id: moduleId,
        module: TestModule.name,
        dynamic: stringify(dynamicMetadata)
      };
      expect(token).to.equal(hash(opaqueToken));
    });
  });

  describe('getDynamicMetadataToken', () => {
    describe('when metadata does not exist', () => {
      it('should return empty string', () => {
        expect(factory.getDynamicMetadataToken(undefined)).to.equal('');
      });
    });

    describe('when metadata exists', () => {
      it('should return hash', () => {
        const dynamicMetadata: DynamicModuleMetadata = {
          providers: [{ token: 'foo', useValue: 'bar' }]
        };
        expect(factory.getDynamicMetadataToken(dynamicMetadata))
          .to.equal(JSON.stringify(dynamicMetadata));
      });

      it('should return hash with class', () => {
        class TestProvider {}
        const dynamicMetadata: DynamicModuleMetadata = {
          providers: [TestProvider],
          exports: [TestProvider]
        };

        sinon.stub(TypeIdFactory, 'get').withArgs(TestProvider).returns('TestProvider');

        expect(factory.getDynamicMetadataToken(dynamicMetadata))
          .to.equal('{"providers":["Class(TestProvider)"],"exports":["Class(TestProvider)"]}');
      });

      it('should serialize symbols in a dynamic metadata object', () => {
        const dynamicMetadata: DynamicModuleMetadata = {
          providers: [
            {
              token: Symbol('a'),
              useValue: 'a'
            },
            {
              token: Symbol('b'),
              useValue: 'b'
            }
          ]
        };

        expect(factory.getDynamicMetadataToken(dynamicMetadata))
          .to.equal('{"providers":[{"token":"Symbol(a)","useValue":"a"},{"token":"Symbol(b)","useValue":"b"}]}');
      });
    });
  });
});
