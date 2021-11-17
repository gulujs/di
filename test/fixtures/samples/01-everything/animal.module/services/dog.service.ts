import { forwardRef, Inject, Injectable } from '../../../../../../src';
import { CatService } from './cat.service';

type Interface<T> = { [P in keyof T]: T[P] };

@Injectable()
export class DogService {
  constructor(@Inject(forwardRef(() => CatService)) public cat: Interface<CatService>) {}
}
