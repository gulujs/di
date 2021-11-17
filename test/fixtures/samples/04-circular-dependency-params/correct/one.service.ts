import { Inject, Injectable } from '../../../../../src';
import { TwoService } from './two.service';

type Interface<T> = { [P in keyof T]: T[P] };

@Injectable()
export class OneService {
  constructor(@Inject({ forwardRef: () => TwoService }) public two: Interface<TwoService>) {}
}
