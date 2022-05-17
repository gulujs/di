/* eslint-disable @typescript-eslint/indent */
import {
  Inject,
  Injectable,
  INQUIRER_TYPE,
  Scope,
  ScopeEnum
} from '../../../../../src';
import { REQUEST } from '../../../request';
import { HelloRequestService } from './hello-request.service';

@Scope(ScopeEnum.Transient)
@Injectable()
export class RequestLogger {
  config: object;

  constructor(
    @Inject(INQUIRER_TYPE) inquirer: typeof HelloRequestService | undefined,
    @Inject(REQUEST) private readonly request: Record<string, unknown>
  ) {
    this.config = inquirer?.logger || {};
  }

  get requestId(): string {
    if (!this.request['id']) {
      this.request['id'] = `${Date.now()}.${Math.floor(Math.random() * 1000000)}`;
    }
    return this.request['id'] as string;
  }

  log(message: string): void {
    console.log({ message, requestId: this.requestId, ...this.config });
  }
}
