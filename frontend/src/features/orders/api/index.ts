import { DATA_MODE } from '../../../app/config/data-mode'
import { ordersRepositoryHttp } from './orders.repository.http'
import { ordersRepositoryMock } from './orders.repository.mock'

export const ordersRepository =
  DATA_MODE === 'api' ? ordersRepositoryHttp : ordersRepositoryMock

