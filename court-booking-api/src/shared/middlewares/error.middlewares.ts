
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/app-error.js'
import { ApiResponse } from '../utils/api-response.js'

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Error de validacion zod
  if (err instanceof ZodError) {
    return ApiResponse.error(
      res,
      'Datos inválidos',
      400,
      err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    )
  }

  // Error operacional propio
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode)
  }

  const isDev = process.env.NODE_ENV === 'development'
  console.error('[ErrorMiddleware]', err)

  return ApiResponse.error(
    res,
    'Error interno del servidor',
    500,
    isDev && err instanceof Error ? err.stack : undefined,
  )
}