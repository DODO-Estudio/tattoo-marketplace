import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
);

export type JWTPayload = { userId: string; email: string };

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as JWTPayload;
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('tattoo_token')?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('tattoo_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set('tattoo_token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
