import {
  Inject,
  Injectable,
  INQUIRER_TYPE,
  Scope,
  ScopeEnum,
  Type
} from '../../../../../src';


@Scope(ScopeEnum.Transient)
@Injectable()
export class TransientLogger {
  @Inject(INQUIRER_TYPE) inquirer: Type<unknown> | undefined | null = null;
  config: object;

  constructor(@Inject(INQUIRER_TYPE) private readonly inquirerType: Type<unknown> | undefined) {
    this.config = (this.inquirerType as { logger: object; } | undefined)?.logger || {};
  }

  log(message: string): void {
    console.log({ message, ...this.config });
  }
}
