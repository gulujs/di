import { Inject, Injectable } from '../../../../../src';
import { OneService } from './one.service';

type Interface<T> = { [P in keyof T]: T[P] };

@Injectable()
export class TwoService {
  constructor(@Inject({ forwardRef: () => OneService }) public one: Interface<OneService>) {}
}
