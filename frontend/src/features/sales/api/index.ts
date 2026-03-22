import { DATA_MODE } from '../../../app/config/data-mode'
import { salesRepositoryHttp } from './sales.repository.http'
import { salesRepositoryMock } from './sales.repository.mock'

export const salesRepository =
  DATA_MODE === 'api' ? salesRepositoryHttp : salesRepositoryMock

