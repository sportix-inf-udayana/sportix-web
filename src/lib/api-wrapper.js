import { NextResponse } from "next/server";
import { getSupabaseUser } from "./supabase";
import { z } from "zod";

export function withAuthAndCatch(handler) {
  return async (request, context) => {
    try {
      // Ekstraksi token otomatis dari Header
      const authHeader = request.headers.get('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      
      const supabase = getSupabaseUser(token);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ success: false, message: "Unauthorized Request" }, { status: 401 });
      }

      // Eksekusi handler utama dengan menginjeksi supabase client dan user
      return await handler(request, { ...context, supabase, user });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, message: "Invalid Payload", errors: error.errors }, { status: 400 });
      }
      
      console.error("[API_ERROR]:", error);
      return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
  };
}