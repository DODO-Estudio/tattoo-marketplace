import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken, errorResponse, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) return errorResponse('Email y contraseña son requeridos');

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tattooProfile: true },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return errorResponse('Credenciales incorrectas', 401);
    }

    const token = await signToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: user.tattooProfile,
    });
    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Error al iniciar sesión', 500);
  }
}
