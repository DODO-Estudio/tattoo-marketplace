import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      tattooProfile: {
        include: { photos: { orderBy: { order: 'asc' } } },
      },
    },
  });

  if (!userData) return errorResponse('Usuario no encontrado', 404);

  return successResponse({
    id: userData.id,
    email: userData.email,
    profile: userData.tattooProfile,
  });
}
