import { forwardRef, Inject, Injectable } from '../../../../../../src';
import { CatService } from './cat.service';

@Injectable()
export class DogService {
  constructor(@Inject(forwardRef(() => CatService)) public cat: CatService) {}
}
