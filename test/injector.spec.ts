import { expect } from 'chai';
import {
  Container,
  Inject,
  Injectable,
  Injector,
  InstanceWrapper,
  ModuleCompiler,
  ModuleWrapper,
  RuntimeError,
  STATIC_CONTEXT
} from '../src';

describe('Injector', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = new Injector();
  });

  describe('loadInstance', () => {
    @Injectable()
    class DependencyOne {}

    @Injectable()
    class DependencyTwo {}

    @Injectable()
    class MainTest {
      @Inject()
      property!: DependencyOne;

      constructor(public one: DependencyOne, public two: DependencyTwo) {}
    }

    let module: ModuleWrapper;
    beforeEach(() => {
      const container = new Container();
      const moduleCompiler = new ModuleCompiler();
      const { metatype, dynamicMetadata, id } = moduleCompiler.compile(class {});
      module = new ModuleWrapper(id, metatype, dynamicMetadata, container);

      module.addProvider(MainTest);
      module.addProvider(DependencyOne);
      module.addProvider(DependencyTwo);
    });

    it('should create an instance of component with proper dependencies', async () => {
      const mainTest = module.providers.get(MainTest)! as InstanceWrapper<MainTest>;
      await injector.loadInstance(mainTest, module);
      const { instance } = mainTest;
      expect(instance!).to.be.an.instanceof(MainTest);
      expect(instance!.one).to.be.an.instanceof(DependencyOne);
      expect(instance!.two).to.be.an.instanceof(DependencyTwo);
    });

    it('should set "isResolved" property to true after instance initialization', async () => {
      const mainTest = module.providers.get(MainTest)! as InstanceWrapper<MainTest>;
      await injector.loadInstance(mainTest, module);
      const { isResolved } = mainTest.getInstanceByContextId(STATIC_CONTEXT);
      expect(isResolved).to.be.true;
    });

    it('should throw RuntimeError when type is not store in collection', async () => {
      let err!: Error;
      try {
        class Foo {}
        const wrapper = new InstanceWrapper({
          token: Foo,
          name: Foo.name,
          metatype: Foo,
          isResolved: false,
          isNewable: true,
          scope: undefined,
          host: undefined
        });
        await injector.loadInstance(wrapper, module);
      } catch (e) {
        err = e as Error;
      }
      expect(err).to.be.an.instanceof(RuntimeError);
    });
  });
});
