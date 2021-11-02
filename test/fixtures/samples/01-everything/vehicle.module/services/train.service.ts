import {
  Injectable,
  Scope,
  ScopeEnum
} from '../../../../../../src';
import { BirdService } from '../../animal.module/services/bird.service';

@Scope(ScopeEnum.Request)
@Injectable()
export class TrainService {
  constructor(public bird: BirdService) {}
}
