import { Module } from '../../../../../src';
import { ChildModule } from './child.module';
import { OneService } from './one.service';

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
