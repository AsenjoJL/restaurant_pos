type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type HttpOptions = {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
}

export const httpClient = async <T>(url: string, options: HttpOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers } = options
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }

  return (await response.json()) as T
}
