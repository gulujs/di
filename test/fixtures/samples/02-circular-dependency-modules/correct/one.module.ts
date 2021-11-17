import { Module, Type } from '../../../../../src';
import { TwoModule } from './two.module';

@Module({
  imports: [{ forwardRef: (): Type<unknown> => TwoModule }]
})
export class OneModule {}
