import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get('province') || '';
  const search = searchParams.get('search') || '';

  const profiles = await prisma.tattooProfile.findMany({
    where: {
      isActive: true,
      ...(province ? { locationProvince: province } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { bio: { contains: search, mode: 'insensitive' } },
              { locationCanton: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      photos: { orderBy: { order: 'asc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse(profiles);
}
