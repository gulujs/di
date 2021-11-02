import { Container } from './container';
import { Injector } from './injector';

export class InstanceLoader {
  private readonly _injector = new Injector(true);

  constructor(private readonly container: Container) {}

  async createInstancesOfDependencies(modules = this.container.modules): Promise<void> {
    const promises: Promise<void>[] = [];
    modules.forEach((module) => {
      module.providers.forEach((wrapper) => {
        promises.push(this._injector.loadProvider(wrapper, module));
      });
    });
    await Promise.all(promises);
  }
}
