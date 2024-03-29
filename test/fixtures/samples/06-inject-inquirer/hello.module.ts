import { HelloController } from './hello.controller';
import { HelloRequestService } from './hello-request/hello-request.service';
import { HelloTransientService } from './hello-transient/hello-transient.service';
import { RequestLogger } from './hello-request/request-logger.service';
import { TransientLogger } from './hello-transient/transient-logger.service';
import { Module } from '../../../../src';


@Module({
  providers: [
    HelloController,
    HelloRequestService,
    HelloTransientService,
    RequestLogger,
    TransientLogger
  ]
})
export class HelloModule {}
