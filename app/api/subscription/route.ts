import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const sub = await prisma.subscription.findUnique({
    where: { userId: user.userId },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });

  return successResponse(sub);
}
