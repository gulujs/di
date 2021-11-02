import { Inject, Injectable } from '../../../../../../src';
import { TrainService } from '../../vehicle.module/services/train.service';

@Injectable()
export class BazService {
  @Inject()
  train!: TrainService;
}
