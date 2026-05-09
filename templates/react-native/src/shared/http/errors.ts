export type AppErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'NETWORK' | 'UNKNOWN'

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error
  if (error instanceof TypeError) return new AppError('Network request failed', 'NETWORK', undefined, error)
  return new AppError('Unexpected error', 'UNKNOWN', undefined, error)
}
