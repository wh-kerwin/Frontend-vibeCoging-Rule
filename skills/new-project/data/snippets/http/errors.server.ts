export type AppErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'UNKNOWN'

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode,
    public readonly status = 500,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function serializeError(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    }
  }

  return {
    status: 500,
    body: {
      code: 'UNKNOWN',
      message: 'Unexpected server error',
    },
  }
}
