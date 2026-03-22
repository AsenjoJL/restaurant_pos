import { DATA_MODE } from '../../../app/config/data-mode'
import { adminRepositoryHttp } from './admin.repository.http'
import { adminRepositoryMock } from './admin.repository.mock'

export const adminRepository =
  DATA_MODE === 'api' ? adminRepositoryHttp : adminRepositoryMock

