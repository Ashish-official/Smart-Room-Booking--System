import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from 'express';
import { AppError } from '../utils/appError.js';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('💥 CRITICAL ERROR:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went  wrong inside the server.',
      });
    }
  }
};
