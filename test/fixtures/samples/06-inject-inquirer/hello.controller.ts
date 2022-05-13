import { Injectable, Scope, ScopeEnum } from '../../../../src';
import { HelloRequestService } from './hello-request/hello-request.service';
import { HelloTransientService } from './hello-transient/hello-transient.service';


@Scope(ScopeEnum.Request)
@Injectable()
export class HelloController {
  constructor(
    private readonly helloTransientService: HelloTransientService,
    private readonly helloRequestService: HelloRequestService
  ) {}

  greetingTransient(): void {
    this.helloTransientService.greeting();
  }

  greetingRequest(): void {
    this.helloRequestService.greeting();
    this.helloRequestService.farewell();
  }
}
