import { Injectable } from '../../../../src';
import { ChildModule } from './child.module';

@Injectable()
export class OneService {
  constructor(public child: ChildModule) {}
}
