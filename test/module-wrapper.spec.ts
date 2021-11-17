import { expect } from 'chai';
import sinon from 'sinon';
import {
  Container,
  Injectable,
  InstanceWrapper,
  Module,
  ModuleCompiler,
  ModuleWrapper,
  Token
} from '../src';
import { RandomStringFactory } from '../src/random-string-factory';

describe('ModuleWrapper', () => {
  let container: Container;
  let module: ModuleWrapper;

  @Module({})
  class TestModule {}

  @Injectable()
  class TestProvider {}

  beforeEach(() => {
    container = new Container();

    const moduleCompiler = new ModuleCompiler();
    const { metatype, dynamicMetadata, id } = moduleCompiler.compile(TestModule);
    module = new ModuleWrapper(id, metatype, dynamicMetadata, container);
  });

  describe('addProvider', () => {
    let spy: sinon.SinonSpy<[key: Token, value: InstanceWrapper], Map<Token, InstanceWrapper>>;

    beforeEach(() => {
      spy = sinon.spy(module.providers, 'set');

      sinon.stub(RandomStringFactory, 'create').returns('constId');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should store provider', () => {
      module.addProvider(TestProvider);
      const instanceWrapper = new InstanceWrapper({
        token: TestProvider,
        name: TestProvider.name,
        metatype: TestProvider,
        isResolved: false,
        isNewable: true,
        scope: undefined,
        host: module
      });
      expect(spy.calledWith(TestProvider, instanceWrapper)).to.be.true;
    });

    describe('addCustomClass', () => {
      it('should store provider', () => {
        const token = 'customProviderToken';

        module.addProvider({ token, useClass: TestProvider });

        const instanceWrapper = new InstanceWrapper({
          token,
          name: TestProvider.name,
          metatype: TestProvider,
          isResolved: false,
          isNewable: true,
          scope: undefined,
          host: module
        });
        expect(spy.calledWith(token, instanceWrapper)).to.be.true;
      });
    });

    describe('addCustomValue', () => {
      it('should store provider', () => {
        const token = 'customProviderToken';
        const useValue = 'foo';

        module.addProvider({ token, useValue });

        const instanceWrapper = new InstanceWrapper({
          token,
          name: token,
          instance: useValue,
          isResolved: true,
          isAsync: false,
          host: module
        });
        expect(spy.calledWith(token, instanceWrapper)).to.be.true;
      });
    });

    describe('addCustomFactory', () => {
      it('should store provider', () => {
        const token = 'customProviderToken';
        const useFactory = (): void => {};

        module.addProvider({ token, useFactory });

        const instanceWrapper = new InstanceWrapper({
          token,
          name: token,
          metatype: useFactory,
          isResolved: false,
          inject: [],
          scope: undefined,
          host: module
        });
        expect(spy.calledWith(token, instanceWrapper)).to.be.true;
      });
    });

    describe('addCustomAlias', () => {
      it('should store provider', () => {
        const token = TestProvider;
        class FooProvider {}

        module.addProvider({ token, useToken: FooProvider });
        const factoryFn = module.providers.get(token)!.metatype!;

        const instanceWrapper = new InstanceWrapper({
          token: TestProvider,
          name: TestProvider.name,
          metatype: factoryFn,
          isResolved: false,
          inject: [FooProvider],
          isAlias: true,
          host: module
        });
        expect(spy.calledWith(TestProvider, instanceWrapper)).to.be.true;
      });
    });
  });
});
