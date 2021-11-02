import { Injectable, Scope, ScopeEnum } from '../../../../../../src';

@Scope(ScopeEnum.Transient)
@Injectable()
export class BullService {}
