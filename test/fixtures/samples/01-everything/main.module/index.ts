import * as Path from 'path';
import { Module } from '../../../../../src';
import { GlobalModule } from '../global.module';
import { VehicleModule } from '../vehicle.module';

@Module({
  imports: [GlobalModule, VehicleModule],
  scanPaths: [Path.join(__dirname, 'services')],
  providers: [
    {
      token: 'NAME',
      useValue: 'LUNJS'
    }
  ]
})
export class MainModule {}
