import { DATA_MODE } from '../../../app/config/data-mode'
import { kioskRepositoryHttp } from './kiosk.repository.http'
import { kioskRepositoryMock } from './kiosk.repository.mock'

export const kioskRepository =
  DATA_MODE === 'api' ? kioskRepositoryHttp : kioskRepositoryMock

