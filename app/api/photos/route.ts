import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const profile = await prisma.tattooProfile.findUnique({ where: { userId: user.userId } });
  if (!profile) return errorResponse('Perfil no encontrado', 404);

  const photos = await prisma.photo.findMany({
    where: { tattooProfileId: profile.id },
    orderBy: { order: 'asc' },
  });

  return successResponse(photos);
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const profile = await prisma.tattooProfile.findUnique({
    where: { userId: user.userId },
    include: { photos: true },
  });
  if (!profile) return errorResponse('Perfil no encontrado', 404);
  if (profile.photos.length >= 20) return errorResponse('Máximo 20 fotos permitidas');

  const { dataUri } = await request.json();
  if (!dataUri) return errorResponse('Imagen requerida');

  const { url, publicId } = await uploadImage(dataUri, 'tattoo-marketplace/gallery');

  const photo = await prisma.photo.create({
    data: {
      userId: user.userId,
      tattooProfileId: profile.id,
      imageUrl: url,
      publicId,
      order: profile.photos.length,
    },
  });

  return successResponse(photo, 201);
}
