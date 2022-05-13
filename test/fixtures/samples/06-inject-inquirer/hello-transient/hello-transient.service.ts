import { Injectable } from '../../../../../src';
import { TransientLogger } from './transient-logger.service';


@Injectable()
export class HelloTransientService {
  static logger = { feature: 'transient' };

  constructor(private readonly logger: TransientLogger) {}

  greeting(): void {
    this.logger.log('Hello transient!');
  }
}
