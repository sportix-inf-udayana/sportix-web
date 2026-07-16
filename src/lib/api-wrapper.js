// src/lib/api-wrapper.js
import { NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (error, req) => {
  console.error(`[API_FAIL] ${req.method} ${req.nextUrl.pathname}:`, error.message);
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal Server Error';
  
  return NextResponse.json(
    { success: false, data: null, error: { code: statusCode, message } },
    { status: statusCode }
  );
};

export const withApiHandler = (handler) => async (req, context) => {
  try {
    const result = await handler(req, context);
    if (result instanceof NextResponse) return result;
    return NextResponse.json({ success: true, data: result, error: null }, { status: 200 });
  } catch (error) {
    return handleError(error, req);
  }
};

export const withAuthAndCatch = (handler) => async (req, context) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Token missing or malformed', 401);
    }
    
    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new AppError('Unauthorized: Invalid or expired session', 401);
    }
    
    const result = await handler(req, { ...context, supabase, user });
    if (result instanceof NextResponse) return result;
    
    return NextResponse.json({ success: true, data: result, error: null }, { status: 200 });
  } catch (error) {
    return handleError(error, req);
  }
};