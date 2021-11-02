import { Injectable } from '../../../../src';
import { TwoService } from '../04-circular-dependency-params/two.service';

@Injectable()
export class OneService {
  constructor(public two: TwoService) {}
}
