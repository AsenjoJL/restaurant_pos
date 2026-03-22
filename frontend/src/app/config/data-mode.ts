import { env } from './env'

export type DataMode = 'mock' | 'api'

export const DATA_MODE: DataMode = env.dataMode

export const isMockMode = () => DATA_MODE === 'mock'

