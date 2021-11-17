import { Inject, Injectable } from '../../../../../src';
import { ChildModule } from './child.module';

type Interface<T> = { [P in keyof T]: T[P] };

@Injectable()
export class OneService {
  constructor(@Inject({ forwardRef: () => ChildModule }) public child: Interface<ChildModule>) {}
}
