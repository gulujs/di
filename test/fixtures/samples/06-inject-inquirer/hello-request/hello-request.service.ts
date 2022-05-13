import {
  Injectable,
  Scope,
  ScopeEnum
} from '../../../../../src';
import { RequestLogger } from './request-logger.service';


@Scope(ScopeEnum.Request)
@Injectable()
export class HelloRequestService {
  static logger = { feature: 'request' };

  constructor(private readonly logger: RequestLogger) {}

  greeting(): void {
    this.logger.log('Hello request!');
  }

  farewell(): void {
    this.logger.log('Goodbye request!');
  }
}
