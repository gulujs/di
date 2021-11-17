import { Module, Type } from '../../../../../src';
import { OneModule } from './one.module';

@Module({
  imports: [{ forwardRef: (): Type<unknown> => OneModule }]
})
export class TwoModule {}
