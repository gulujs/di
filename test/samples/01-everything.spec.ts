import { expect } from 'chai';
import {
  Container,
  ContextIdFactory,
  Injector,
  InstanceLoader,
  DependenciesScanner,
  ModuleWrapper,
  InternalCoreModule
} from '../../src';
import { MainModule } from '../fixtures/samples/01-everything/main.module';
import { VehicleModule } from '../fixtures/samples/01-everything/vehicle.module';
import { AnimalModule } from '../fixtures/samples/01-everything/animal.module';
import { FOO } from '../fixtures/samples/01-everything/main.module/services/foo.service';
import { BarService, CustomClass } from '../fixtures/samples/01-everything/main.module/services/bar.service';
import { CatService } from '../fixtures/samples/01-everything/animal.module/services/cat.service';
import { GlobalModule } from '../fixtures/samples/01-everything/global.module';
import { BazService } from '../fixtures/samples/01-everything/main.module/services/baz.service';
import { AsdfService } from '../fixtures/samples/01-everything/main.module/services/asdf.service';
import { BullService } from '../fixtures/samples/01-everything/animal.module/services/bull.service';

describe('01-everything', () => {
  let container: Container;
  let mainModule: ModuleWrapper;
  let injector: Injector;

  beforeEach(async () => {
    container = new Container();
    const scanner = new DependenciesScanner(container);
    await scanner.registerCoreModule(InternalCoreModule);
    await scanner.scan(MainModule);

    const instanceLoader = new InstanceLoader(container);
    await instanceLoader.createInstancesOfDependencies();

    mainModule = container.findModule(module => module.metatype === MainModule)!;

    injector = new Injector();
  });

  it('should contains the correct modules', () => {
    const rawModules = [...container.modules.values()].map(it => it.metatype);
    expect(rawModules).to.have.members([InternalCoreModule, MainModule, VehicleModule, AnimalModule, GlobalModule]);
  });

  it('should load static context instance', () => {
    const fooWrapper = mainModule.getProviderByToken<CatService>(FOO)!;
    const barWrapper = mainModule.getProviderByToken(BarService)!;
    const bazWrapper = mainModule.getProviderByToken(BazService)!;
    const asdfWrapper = mainModule.getProviderByToken(AsdfService)!;
    expect(fooWrapper.instance).to.be.an.instanceof(CatService);
    expect(barWrapper.instance).to.be.an.instanceof(BarService);
    expect(bazWrapper.instance).to.be.undefined;
    expect(asdfWrapper.instance).to.be.undefined;
  });

  describe('decorators', () => {
    describe('@Init', () => {
      it('should run init method', () => {
        const barWrapper = mainModule.getProviderByToken(BarService)!;
        expect(barWrapper.instance!.data).to.equal('INIT');
      });
    });
  });

  describe('scope', () => {
    describe('when scope is "Request"', () => {
      it('should load same instance in same context', async () => {
        const bazWrapper = mainModule.getProviderByToken(BazService)!;

        const ctx = ContextIdFactory.create();
        const instance1 = await injector.loadPerContext(bazWrapper, mainModule, ctx);
        const instance2 = await injector.loadPerContext(bazWrapper, mainModule, ctx);

        expect(instance1).to.be.an.instanceof(BazService);
        expect(instance2).to.be.an.instanceof(BazService);
        expect(instance1).to.equal(instance2);
      });

      it('should load difference instance in each context', async () => {
        const bazWrapper = mainModule.getProviderByToken(BazService)!;

        const ctx1 = ContextIdFactory.create();
        const instance1 = await injector.loadPerContext(bazWrapper, mainModule, ctx1);

        const ctx2 = ContextIdFactory.create();
        const instance2 = await injector.loadPerContext(bazWrapper, mainModule, ctx2);

        expect(instance1).to.be.an.instanceof(BazService);
        expect(instance2).to.be.an.instanceof(BazService);
        expect(instance1).to.not.equal(instance2);
      });
    });

    describe('when scope is "Transient"', () => {
      it('should load difference instance in same context', async () => {
        const bazWrapper = mainModule.getProviderByToken(BazService)!;
        const asdfWrapper = mainModule.getProviderByToken(AsdfService)!;

        const ctx = ContextIdFactory.create();

        const bazInstance = await injector.loadPerContext(bazWrapper, mainModule, ctx);
        const asdfInstance = await injector.loadPerContext(asdfWrapper, mainModule, ctx);

        expect(bazInstance!.train.bird).to.not.equal(asdfInstance!.bird);
      });
    });
  });

  describe('ModuleRef', () => {
    describe('get', () => {
      it('should get the instance', () => {
        const barWrapper = mainModule.getProviderByToken(BarService)!;

        const cat = barWrapper.instance!.getCat();
        expect(cat).to.be.an.instanceof(CatService);
      });
    });

    describe('resolve', () => {
      it('should resolve the instance', async () => {
        const contextId = ContextIdFactory.create();
        const request = {};
        ContextIdFactory.setForRequest(request, contextId);
        container.registerRequestProvider(request, contextId);
        const asdfWrapper = mainModule.getProviderByToken(AsdfService)!;

        const asdfInstance = await injector.loadPerContext(asdfWrapper, mainModule, contextId);
        const bull = await asdfInstance!.resolveBull();
        expect(bull).to.be.an.instanceof(BullService);

        const animalModule = container.findModule(module => module.metatype === AnimalModule)!;
        const bullWrapper = animalModule.getProviderByToken(BullService)!;
        expect(bull).to.equal(bullWrapper.getInstanceByContextId(contextId, { wrapper: bullWrapper }).instance);
      });
    });

    describe('create', () => {
      it('should create the instance', async () => {
        const barWrapper = mainModule.getProviderByToken(BarService)!;
        const custom = await barWrapper.instance!.createCustomClass();
        expect(custom).to.be.an.instanceof(CustomClass);
      });
    });
  });
});
