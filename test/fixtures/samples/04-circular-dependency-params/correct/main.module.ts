import { Module } from '../../../../../src';
import { OneService } from './one.service';
import { TwoService } from './two.service';

@Module({
  providers: [OneService, TwoService]
})
export class MainModule {}
