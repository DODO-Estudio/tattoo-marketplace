import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { profileId, contactMethod } = await request.json();
    if (!profileId || !contactMethod) return errorResponse('Datos requeridos');

    await prisma.contactClick.create({
      data: {
        tattooProfileId: profileId,
        contactMethod,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return successResponse({ ok: true });
  } catch {
    return successResponse({ ok: true }); // never block the user
  }
}
