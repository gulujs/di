import { expect } from 'chai';
import sinon from 'sinon';
import {
  Container,
  ContextIdFactory,
  DependenciesScanner,
  Injector,
  InstanceLoader,
  InternalCoreModule,
  ModuleWrapper
} from '../../src';
import {
  registerRequestProvider,
  requestProvider,
  setForRequest
} from '../fixtures/request';
import { HelloController } from '../fixtures/samples/06-inject-inquirer/hello.controller';
import { HelloModule } from '../fixtures/samples/06-inject-inquirer/hello.module';

describe('06-inject-inquirer', () => {
  let container: Container;
  let helloModule: ModuleWrapper;
  let injector: Injector;

  beforeEach(async () => {
    container = new Container();
    const scanner = new DependenciesScanner(container);
    await scanner.registerCoreModule(InternalCoreModule.register([requestProvider]));
    await scanner.scan(HelloModule);

    const instanceLoader = new InstanceLoader(container);
    await instanceLoader.createInstancesOfDependencies();

    helloModule = container.findModule(module => module.metatype === HelloModule)!;

    injector = new Injector();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should allow the injection of inquirer in a Transient Scope', async () => {
    const logStub = sinon.stub(console, 'log');

    const contextId = ContextIdFactory.create();
    const request = {};
    setForRequest(request, contextId);
    registerRequestProvider(container, request, contextId);

    const helloControllerWrapper = helloModule.getProviderByToken(HelloController)!;

    const helloController = await injector.loadPerContext(helloControllerWrapper, helloModule, contextId);
    helloController!.greetingTransient();

    expect(logStub.calledWith({
      message: 'Hello transient!',
      feature: 'transient'
    })).to.be.true;
  });

  it('should allow the injection of the inquirer in a Request Scope', async () => {
    const logStub = sinon.stub(console, 'log');

    const contextId = ContextIdFactory.create();
    const request = {};
    setForRequest(request, contextId);
    registerRequestProvider(container, request, contextId);

    const helloControllerWrapper = helloModule.getProviderByToken(HelloController)!;

    const helloController = await injector.loadPerContext(helloControllerWrapper, helloModule, contextId);
    helloController!.greetingRequest();

    expect(logStub.calledWith({
      message: 'Hello request!',
      requestId: sinon.match.string,
      feature: 'request'
    })).to.be.true;

    const requestId = logStub.getCall(0).args[0].requestId as string;
    expect(logStub.calledWith({
      message: 'Goodbye request!',
      requestId,
      feature: 'request'
    })).to.be.true;
  });
});
