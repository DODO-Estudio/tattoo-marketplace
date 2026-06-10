import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken, errorResponse, setAuthCookie } from '@/lib/auth';

function buildSlug(name: string, province: string): string {
  const normalize = (s: string) =>
    s.toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  return `${normalize(name)}-${normalize(province)}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, locationProvince } = await request.json();

    if (!email || !password || !name || !locationProvince) {
      return errorResponse('Todos los campos son requeridos');
    }
    if (password.length < 6) {
      return errorResponse('La contraseña debe tener al menos 6 caracteres');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse('Este email ya está registrado');

    const baseSlug = buildSlug(name, locationProvince);
    const slugExists = await prisma.tattooProfile.findUnique({ where: { slug: baseSlug } });
    const slug = slugExists ? `${baseSlug}-${Date.now()}` : baseSlug;

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        tattooProfile: {
          create: { name, locationProvince, slug, isActive: false },
        },
      },
      include: { tattooProfile: true },
    });

    const token = await signToken({ userId: user.id, email: user.email });
    const response = NextResponse.json(
      { user: { id: user.id, email: user.email }, profile: user.tattooProfile },
      { status: 201 }
    );
    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Error al crear la cuenta', 500);
  }
}
