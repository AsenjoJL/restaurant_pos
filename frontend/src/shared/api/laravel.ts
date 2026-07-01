import { apiFetch } from './http'

type LaravelCollectionResponse<T> = {
  data: T[]
  meta?: {
    current_page?: number
    last_page?: number
  }
}

type LaravelItemResponse<T> = {
  data?: T
} & T

export const unwrapLaravelItem = <T>(payload: LaravelItemResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data
  }

  return payload as T
}

export const fetchLaravelCollection = async <T>(path: string, options?: RequestInit): Promise<T[]> => {
  const response = await apiFetch<LaravelCollectionResponse<T>>(path, options)
  return Array.isArray(response.data) ? response.data : []
}

const withPageParam = (path: string, page: number) =>
  `${path}${path.includes('?') ? '&' : '?'}page=${page}`

export const fetchAllLaravelCollection = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T[]> => {
  const firstPage = await apiFetch<LaravelCollectionResponse<T>>(withPageParam(path, 1), options)
  const firstItems = Array.isArray(firstPage.data) ? firstPage.data : []
  const lastPage = Math.max(firstPage.meta?.last_page ?? 1, 1)

  if (lastPage === 1) {
    return firstItems
  }

  const remainingPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      apiFetch<LaravelCollectionResponse<T>>(withPageParam(path, index + 2), options),
    ),
  )

  return firstItems.concat(
    remainingPages.flatMap((page) => (Array.isArray(page.data) ? page.data : [])),
  )
}

export const fetchLaravelItem = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await apiFetch<LaravelItemResponse<T>>(path, options)
  return unwrapLaravelItem(response)
}
