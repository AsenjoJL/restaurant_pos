import { DATA_MODE } from '../../../app/config/data-mode'
import { kitchenRepositoryHttp } from './kitchen.repository.http'
import { kitchenRepositoryMock } from './kitchen.repository.mock'

export const kitchenRepository =
  DATA_MODE === 'api' ? kitchenRepositoryHttp : kitchenRepositoryMock

