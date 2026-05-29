import { describe, it, expect } from 'vitest'
import { AppError, toAppError } from './errors'

// This file is the canonical example of how to colocate unit tests.
// Place *.test.ts next to the file it covers, not in a separate __tests__ folder.

describe('AppError', () => {
  it('sets name to AppError', () => {
    const err = new AppError('oops', 'UNKNOWN')
    expect(err.name).toBe('AppError')
    expect(err.message).toBe('oops')
    expect(err.code).toBe('UNKNOWN')
  })

  it('stores optional status and cause', () => {
    const cause = new Error('root')
    const err = new AppError('forbidden', 'FORBIDDEN', 403, cause)
    expect(err.status).toBe(403)
    expect(err.cause).toBe(cause)
  })
})

describe('toAppError', () => {
  it('passes AppError through unchanged', () => {
    const original = new AppError('not found', 'NOT_FOUND', 404)
    expect(toAppError(original)).toBe(original)
  })

  it('maps TypeError to NETWORK code', () => {
    const err = toAppError(new TypeError('Failed to fetch'))
    expect(err.code).toBe('NETWORK')
  })

  it('maps unknown values to UNKNOWN code', () => {
    expect(toAppError('oops').code).toBe('UNKNOWN')
    expect(toAppError(null).code).toBe('UNKNOWN')
    expect(toAppError(42).code).toBe('UNKNOWN')
  })
})
