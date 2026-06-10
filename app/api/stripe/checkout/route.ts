import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe, PRICES } from '@/lib/stripe';
import { getUserFromRequest, errorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);

  const profile = await prisma.tattooProfile.findUnique({ where: { userId: user.userId } });
  if (!profile) return errorResponse('Perfil no encontrado', 404);

  // Si ya tiene suscripción activa, no crear otra
  const existingSub = await prisma.subscription.findUnique({ where: { userId: user.userId } });
  if (existingSub?.status === 'active') {
    return errorResponse('Ya tienes una suscripción activa');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Crear o reutilizar customer de Stripe
  let customerId = existingSub?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.userId, profileName: profile.name },
    });
    customerId = customer.id;
  }

  // Elegir precio: launch si aún no han pagado nunca, regular si ya tuvieron suscripción
  const priceId = !existingSub ? PRICES.launch : PRICES.regular;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/suscripcion?success=1`,
    cancel_url: `${baseUrl}/dashboard/suscripcion?canceled=1`,
    metadata: { userId: user.userId },
    subscription_data: {
      metadata: { userId: user.userId },
      // 3 meses al precio de lanzamiento → el precio regular se aplica desde afuera
      trial_period_days: priceId === PRICES.launch ? undefined : undefined,
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
