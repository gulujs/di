import { Module } from '../../../../../src';
import { OneModule } from './one.module';

@Module({
  imports: [OneModule]
})
export class MainModule {}
