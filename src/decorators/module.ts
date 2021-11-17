import * as Path from 'path';
import { fileURLToPath } from 'url';
import { callerPath } from '@lunjs/caller-path';
import { ModuleMetadata, Type } from '../interfaces';
import {
  setModuleExportsMetadata,
  setModuleImportsMetadata,
  setModuleProvidersMetadata,
  setModuleProvidersScanPathsMetadata
} from '../helpers/metadata-utils';
import { isUndefined } from '../helpers/common-utils';

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: object): void => {
    if (metadata.imports) {
      setModuleImportsMetadata(target as Type<unknown>, metadata.imports);
    }

    if (metadata.scanPaths && metadata.scanPaths.length > 0) {
      let basePath: string | undefined;
      const scanPaths: string[] = [];

      for (const path of metadata.scanPaths) {
        if (!path) {
          continue;
        }

        if (Path.isAbsolute(path)) {
          scanPaths.push(path);
          continue;
        }

        if (path.startsWith('file:')) {
          scanPaths.push(fileURLToPath(path));
          continue;
        }

        if (isUndefined(basePath)) {
          let filename = callerPath({ shift: 1, excludeFileNames: [/node_modules\/reflect-metadata/] })!;
          if (filename.startsWith('file:')) {
            filename = fileURLToPath(filename);
          }
          basePath = Path.dirname(filename);
        }

        scanPaths.push(Path.join(basePath, path));
      }
      setModuleProvidersScanPathsMetadata(target as Type<unknown>, scanPaths);
    }

    if (metadata.providers) {
      setModuleProvidersMetadata(target as Type<unknown>, metadata.providers);
    }

    if (metadata.exports) {
      setModuleExportsMetadata(target as Type<unknown>, metadata.exports);
    }
  };
}
