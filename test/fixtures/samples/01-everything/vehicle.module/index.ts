import { Module } from '../../../../../src';
import { AnimalModule } from '../animal.module';
import { BUS } from './services/bus.service';
import { TrainService } from './services/train.service';

export const DUCK = 'DUCK';

@Module({
  imports: [AnimalModule.forRoot([{ token: DUCK, useValue: 'I am a duck.' }])],
  scanPaths: ['./services'],
  exports: [AnimalModule, BUS, TrainService]
})
export class VehicleModule {}
