import { FactoryProvider } from '../../../../../../src';
import { CarService } from './car.service';

export const BUS = 'BUS';
export interface BusObject {
  car: CarService;
}

export const busService: FactoryProvider = {
  token: BUS,
  useFactory: (car: CarService): BusObject => {
    return {
      car
    };
  },
  inject: [CarService]
};
