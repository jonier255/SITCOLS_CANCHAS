
import { Response } from 'express'

interface Meta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export const ApiResponse = {
  ok<T>(res: Response, data: T, meta?: Meta, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(meta && { meta }),
    })
  },

  created<T>(res: Response, data: T) {
    return ApiResponse.ok(res, data, undefined, 201)
  },

  noContent(res: Response) {
    return res.status(204).send()
  },

  error(res: Response, message: string, statusCode = 500, details?: unknown) {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(typeof details === 'object' && details !== null ? { details } : {}),
      },
    })
  },
}