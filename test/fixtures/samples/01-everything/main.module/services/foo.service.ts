import { AliasProvider } from '../../../../../../src';
import { CatService } from '../../animal.module/services/cat.service';

export const FOO = 'FOO';

export const fooService: AliasProvider = {
  token: FOO,
  useToken: CatService
};
