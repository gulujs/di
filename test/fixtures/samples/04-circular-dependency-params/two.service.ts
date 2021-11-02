import { Injectable } from '../../../../src';
import { OneService } from './one.service';

@Injectable()
export class TwoService {
  constructor(public one: OneService) {}
}
