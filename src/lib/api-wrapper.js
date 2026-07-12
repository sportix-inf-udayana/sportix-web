import { NextResponse } from 'next/server';

/**
 * API Route Wrapper
 * @param {Function} handler - Fungsi async route handler
 * @returns {Function} Next.js route handler
 */
export const withApiHandler = (handler) => {
  return async (req, context) => {
    try {
      const result = await handler(req, context);
      return NextResponse.json({
        success: true,
        data: result,
        error: null,
      }, { status: 200 });
    } catch (error) {

      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error.message);

      const statusCode = error.statusCode || 500;
      const message = error.isOperational ? error.message : 'Internal Server Error';

      return NextResponse.json({
        success: false,
        data: null,
        error: {
          code: statusCode,
          message: message,
        }
      }, { status: statusCode });
    }
  };
};

/**
 * Custom Operational Error
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Membedakan dari programming errors/bugs
    Error.captureStackTrace(this, this.constructor);
  }
}