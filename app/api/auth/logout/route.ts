import { NextRequest, NextResponse } from 'next/server';
import { logout, clearAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await logout();
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: false, error: 'Logout failed' });
    clearAuthCookie(response);
    return response;
  }
}
