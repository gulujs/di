import {
  Init,
  Inject,
  Injectable,
  ModuleRef
} from '../../../../../../src';
import { BirdService } from '../../animal.module/services/bird.service';
import { CatService } from '../../animal.module/services/cat.service';
import { BUS, BusObject } from '../../vehicle.module/services/bus.service';

export class CustomClass {
  constructor(public bird: BirdService) {}
}

@Injectable()
export class BarService {
  data!: string;

  @Inject()
  moduleRef!: ModuleRef;

  constructor(@Inject(BUS) public bus: BusObject) {}

  @Init()
  async init(): Promise<void> {
    this.data = await Promise.resolve('INIT');
  }

  getCat(): CatService {
    return this.moduleRef.get(CatService);
  }

  async createCustomClass(): Promise<CustomClass | undefined> {
    return this.moduleRef.create(CustomClass);
  }
}
