export type EntityId = string

export type PaginatedResult<T> = {
  data: T[]
  total: number
}

export type RepositoryResult<T> = Promise<T>

