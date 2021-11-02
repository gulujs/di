import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  Container,
  Global,
  Module,
  ModuleCompiler,
  ModuleWrapper,
  UnknownModuleError
} from '../src';

describe('Container', () => {
  let container: Container;

  @Module({})
  class TestModule {}

  @Global()
  @Module({})
  class GlobalTestModule {}

  beforeEach(() => {
    container = new Container();
  });

  describe('addModule', () => {
    it('should not add module if already exists in collection', () => {
      const modules = new Map();
      const setSpy = sinon.spy(modules, 'set');
      (container as any)._modules = modules;

      container.addModule(TestModule);
      container.addModule(TestModule);

      expect(setSpy.calledOnce).to.be.true;
    });

    it('should add global module when module is global', () => {
      const addGlobalModuleSpy = sinon.spy(container, 'addGlobalModule');
      container.addModule(GlobalTestModule);
      expect(addGlobalModuleSpy.calledOnce).to.be.true;
    });
  });

  describe('addProvider', () => {
    it('should throw "UnknownModuleError" when module is not stored in collection', () => {
      const anotherContainer = new Container();
      const moduleCompiler = new ModuleCompiler();
      const { metatype, dynamicMetadata, id } = moduleCompiler.compile(TestModule);
      const moduleWrapper = new ModuleWrapper(id, metatype, dynamicMetadata, anotherContainer);
      const provider = { token: 'foo', useValue: 'bar' };
      expect(() => container.addProvider(provider, moduleWrapper))
        .to.throw(UnknownModuleError);
    });
  });

  describe('isGlobalModule', () => {
    describe('when module is not globally scoped', () => {
      it('should return false', () => {
        expect(container.isGlobalModule(TestModule)).to.be.false;
      });
    });

    describe('when module is globally scoped', () => {
      it('should return true', () => {
        expect(container.isGlobalModule(GlobalTestModule)).to.be.true;
      });
    });

    describe('when dynamic module is globally scoped', () => {
      it('should return true', () => {
        expect(container.isGlobalModule(TestModule, { global: true })).to.be.true;
      });
    });
  });
});
