import { Injectable } from '../../../../src';
import { TwoService } from './two.service';

@Injectable()
export class OneService {
  constructor(public two: TwoService) {}
}
