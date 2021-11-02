import { RuntimeError } from './runtime-error';

export class CircularDependencyError extends RuntimeError {
  constructor(context?: string) {
    const ctx = context ? ` inside ${context}` : '';
    super(`A circular dependency has been detected${ctx}. Please, make sure that each side of a bidirectional relationships are decorated with "forwardRef()".`);
  }
}
