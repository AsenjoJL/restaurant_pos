import { DATA_MODE } from '../../../app/config/data-mode'
import { inventoryRepositoryHttp } from './inventory.repository.http'
import { inventoryRepositoryMock } from './inventory.repository.mock'

export const inventoryRepository =
  DATA_MODE === 'api' ? inventoryRepositoryHttp : inventoryRepositoryMock

