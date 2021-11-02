import { Module } from '../../../../src';
import { OneService } from './one.service';

@Module({
  providers: [OneService]
})
export class MainModule {}
