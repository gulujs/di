import { forwardRef, Inject, Injectable } from '../../../../../../src';
import { DogService } from './dog.service';

@Injectable()
export class CatService {
  constructor(@Inject(forwardRef(() => DogService)) public dog: DogService) {}
}
