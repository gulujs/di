import { Global, Module } from '../../../../../src';

@Global()
@Module({
  scanPaths: [__dirname]
})
export class GlobalModule {}
