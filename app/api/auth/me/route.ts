import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request);
  
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({ 
    success: true, 
    data: { 
      user: auth.user,
      isAdmin: auth.isAdmin 
    } 
  });
}
