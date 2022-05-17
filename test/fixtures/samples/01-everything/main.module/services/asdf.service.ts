import {
  Inject,
  Injectable,
  ModuleRef,
  Scope,
  ScopeEnum,
  SearchScope
} from '../../../../../../src';
import { getByRequest, REQUEST } from '../../../../request';
import { BirdService } from '../../animal.module/services/bird.service';
import { BullService } from '../../animal.module/services/bull.service';

@Scope(ScopeEnum.Request)
@Injectable()
export class AsdfService {
  constructor(
    public bird: BirdService,
    @Inject(REQUEST) public request: Record<string, unknown>,
    private readonly moduleRef: ModuleRef
  ) {}

  resolveBull(): Promise<BullService> {
    const contextId = getByRequest(this.request);
    return this.moduleRef.resolve(BullService, contextId, { searchScope: SearchScope.Container });
  }
}
