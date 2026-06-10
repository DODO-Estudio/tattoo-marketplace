import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { getUserFromRequest, errorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const sub = await prisma.subscription.findUnique({ where: { userId: user.userId } });
  if (!sub?.stripeCustomerId) {
    return errorResponse('No tienes una suscripción activa');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/suscripcion`,
  });

  return NextResponse.json({ url: session.url });
}
