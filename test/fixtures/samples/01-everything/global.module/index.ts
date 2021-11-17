import { Global, Module } from '../../../../../src';
import * as Path from 'path';

@Global()
@Module({
  scanPaths: [Path.dirname(import.meta.url)]
})
export class GlobalModule {}
