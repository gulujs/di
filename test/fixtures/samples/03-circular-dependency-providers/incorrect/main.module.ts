import { Module } from '../../../../../src';
import { OneService } from './one.service';
import { ChildModule } from './child.module';

@Module({
  imports: [ChildModule],
  providers: [
    {
      token: OneService,
      useValue: {}
    }
  ]
})
export class MainModule {}
