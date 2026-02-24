import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, getUserByEmailWithPassword, UserPublic, getUserById } from './users-db';
import crypto from 'crypto';

const SESSION_COOKIE = 'session_token';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface Session {
  userId: number;
  role: string;
  expiresAt: number;
}

const sessions = new Map<string, Session>();

export function createSession(userId: number, role: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_DURATION;
  sessions.set(token, { userId, role, expiresAt });
  return token;
}

export function getSession(token: string): Session | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  
  const session = getSession(token);
  if (!session) return null;
  
  return getUserById(session.userId);
}

export async function requireAuth(): Promise<UserPublic> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<UserPublic> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}

export async function login(email: string, password: string): Promise<{ user: UserPublic; token: string } | null> {
  const user = getUserByEmailWithPassword(email);
  if (!user || user.status !== 'active') return null;
  if (!verifyPassword(password, user.password_hash)) return null;
  
  const token = createSession(user.id, user.role);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at
    },
    token
  };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    deleteSession(token);
  }
}

export async function authMiddleware(request: NextRequest): Promise<{ user: UserPublic | null; isAuthenticated: boolean; isAdmin: boolean }> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return { user: null, isAuthenticated: false, isAdmin: false };
  }

  const session = getSession(token);
  if (!session) {
    return { user: null, isAuthenticated: false, isAdmin: false };
  }

  const user = await getUserById(session.userId);
  if (!user || user.status !== 'active') {
    return { user: null, isAuthenticated: false, isAdmin: false };
  }

  return {
    user,
    isAuthenticated: true,
    isAdmin: user.role === 'admin'
  };
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE);
}
