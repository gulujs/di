import { RuntimeError } from './runtime-error';

export class UnknownExportError extends RuntimeError {
  constructor(tokenName: string, moduleName: string) {
    const message = `@lunjs/di cannot export a provider/module that is not a part of the currently processed module (${moduleName}). Please verify whether the exported ${tokenName} is available in this particular context.

Possible Solutions:
- Is ${tokenName} part of the relevant providers/imports within ${moduleName}?
`;
    super(message);
  }
}
