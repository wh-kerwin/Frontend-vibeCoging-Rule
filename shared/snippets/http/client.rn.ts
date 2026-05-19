import { AppError, toAppError } from './errors'

export interface HttpClientOptions {
  baseUrl: string
  getToken?: () => string | null | Promise<string | null>
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  timeoutMs?: number
}

export function createHttpClient(options: HttpClientOptions) {
  async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
    const controller = new AbortController()
    // Use global setTimeout (not window.setTimeout) for React Native compatibility
    const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? 15000)

    try {
      const token = await options.getToken?.()
      const traceId = Math.random().toString(36).slice(2)

      const response = await fetch(`${options.baseUrl}${path}`, {
        ...init,
        signal: init.signal ?? controller.signal,
        headers: {
          'content-type': 'application/json',
          'x-request-id': traceId,
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : null

      if (!response.ok) {
        throw new AppError(data?.message ?? response.statusText, mapStatus(response.status), response.status, data)
      }

      return data as T
    } catch (error) {
      throw toAppError(error)
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    get: <T>(path: string, init?: RequestOptions) => request<T>(path, { ...init, method: 'GET' }),
    post: <T>(path: string, body?: unknown, init?: RequestOptions) => request<T>(path, { ...init, method: 'POST', body }),
    patch: <T>(path: string, body?: unknown, init?: RequestOptions) => request<T>(path, { ...init, method: 'PATCH', body }),
    put: <T>(path: string, body?: unknown, init?: RequestOptions) => request<T>(path, { ...init, method: 'PUT', body }),
    delete: <T>(path: string, init?: RequestOptions) => request<T>(path, { ...init, method: 'DELETE' }),
  }
}

function mapStatus(status: number): import('./errors').AppErrorCode {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 422 || status === 400) return 'VALIDATION'
  return 'UNKNOWN'
}

export const http = createHttpClient({
  baseUrl: process.env.%API_BASE_VAR% ?? '',
})
