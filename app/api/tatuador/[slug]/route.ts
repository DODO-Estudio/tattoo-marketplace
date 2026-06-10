import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const profile = await prisma.tattooProfile.findUnique({
    where: { slug: params.slug },
    include: { photos: { orderBy: { order: 'asc' } } },
  });

  if (!profile) return errorResponse('Tatuador no encontrado', 404);

  // Track page view (fire and forget)
  prisma.pageView
    .create({
      data: {
        tattooProfileId: profile.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || '',
        referer: request.headers.get('referer') || '',
      },
    })
    .catch(() => {});

  return successResponse(profile);
}
