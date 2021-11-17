import { Module } from '../../../../../src';
import { TwoModule } from './two.module';

@Module({
  imports: [TwoModule]
})
export class OneModule {}
