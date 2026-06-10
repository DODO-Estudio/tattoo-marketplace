import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const profile = await prisma.tattooProfile.findUnique({
    where: { userId: user.userId },
    include: { photos: { orderBy: { order: 'asc' } } },
  });

  if (!profile) return errorResponse('Perfil no encontrado', 404);
  return successResponse(profile);
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const { name, bio, locationProvince, locationCanton, phone, whatsapp, instagram, basePrice, themeColor } =
    await request.json();

  if (!name || !locationProvince) return errorResponse('Nombre y provincia son requeridos');

  const profile = await prisma.tattooProfile.update({
    where: { userId: user.userId },
    data: {
      name,
      bio: bio || null,
      locationProvince,
      locationCanton: locationCanton || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
      basePrice: basePrice ? parseInt(basePrice) : null,
      themeColor: themeColor || '#667eea',
    },
  });

  return successResponse(profile);
}
