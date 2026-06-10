import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const photo = await prisma.photo.findUnique({ where: { id: params.id } });
  if (!photo) return errorResponse('Foto no encontrada', 404);
  if (photo.userId !== user.userId) return errorResponse('No autorizado', 403);

  await deleteImage(photo.publicId);
  await prisma.photo.delete({ where: { id: params.id } });

  return successResponse({ message: 'Foto eliminada' });
}
