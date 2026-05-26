// Result type used by every service function — never throws to the caller.
// The compiler forces handling of both success and failure at every call site.

export type AppError = {
  code: "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "INTERNAL"
  message: string
  details?: unknown // Extra context for debugging — never sent to client raw
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError }

// Convenience constructor for success
export const ok = <T>(data: T): Result<T> => ({ success: true, data })

// Convenience constructor for failure
export const err = (error: AppError): Result<never> => ({ success: false, error })
