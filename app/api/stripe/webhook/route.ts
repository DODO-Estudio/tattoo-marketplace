import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }
    }
  } catch (err) {
    console.error(`Error procesando evento ${event.type}:`, err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId || !session.subscription) return;

  const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
  const price = stripeSub.items.data[0]?.price;

  // Buscar la invoice del primer pago para registrarlo
  const invoices = await stripe.invoices.list({
    subscription: stripeSub.id,
    limit: 1,
  });
  const firstInvoice = invoices.data[0];

  await prisma.$transaction(async (tx) => {
    const dbSub = await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubscriptionId: stripeSub.id,
        stripeCustomerId: session.customer as string,
        status: 'active',
        currentPrice: price?.unit_amount ?? 0,
        startedAt: new Date(stripeSub.start_date * 1000),
        renewsAt: new Date(stripeSub.current_period_end * 1000),
      },
      update: {
        stripeSubscriptionId: stripeSub.id,
        stripeCustomerId: session.customer as string,
        status: 'active',
        currentPrice: price?.unit_amount ?? 0,
        startedAt: new Date(stripeSub.start_date * 1000),
        renewsAt: new Date(stripeSub.current_period_end * 1000),
        canceledAt: null,
      },
    });

    // Registrar el primer pago si existe y fue exitoso
    if (firstInvoice && firstInvoice.payment_intent && firstInvoice.amount_paid > 0) {
      const paymentIntentId = typeof firstInvoice.payment_intent === 'string'
        ? firstInvoice.payment_intent
        : firstInvoice.payment_intent.id;

      // Evitar duplicados
      const exists = await tx.payment.findUnique({ where: { stripePaymentId: paymentIntentId } });
      if (!exists) {
        await tx.payment.create({
          data: {
            subscriptionId: dbSub.id,
            stripePaymentId: paymentIntentId,
            amount: firstInvoice.amount_paid,
            currency: firstInvoice.currency.toUpperCase(),
            status: 'succeeded',
            description: 'Primer pago — Suscripción TattooFind CR',
          },
        });
      }
    }

    // Activar el perfil en el marketplace
    await tx.tattooProfile.update({
      where: { userId },
      data: { isActive: true },
    });
  });
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
  const userId = stripeSub.metadata?.userId;
  if (!userId) return;

  const isActive = ['active', 'trialing'].includes(stripeSub.status);
  const price = stripeSub.items.data[0]?.price;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { userId },
      data: {
        status: stripeSub.status,
        currentPrice: price?.unit_amount ?? 0,
        renewsAt: new Date(stripeSub.current_period_end * 1000),
        canceledAt: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
      },
    });
    await tx.tattooProfile.update({
      where: { userId },
      data: { isActive },
    });
  });
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  const userId = stripeSub.metadata?.userId;
  if (!userId) return;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { userId },
      data: { status: 'canceled', canceledAt: new Date() },
    });
    await tx.tattooProfile.update({
      where: { userId },
      data: { isActive: false },
    });
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });
  if (!sub) return;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: sub.id },
      data: { status: 'past_due' },
    });
    await tx.tattooProfile.update({
      where: { userId: sub.userId },
      data: { isActive: false },
    });
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !invoice.payment_intent) return;

  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });
  if (!sub) return;

  const paymentIntentId = typeof invoice.payment_intent === 'string'
    ? invoice.payment_intent
    : invoice.payment_intent.id;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'active',
        renewsAt: new Date(invoice.period_end * 1000),
      },
    });
    await tx.tattooProfile.update({
      where: { userId: sub.userId },
      data: { isActive: true },
    });

    // Evitar duplicados (puede llegar junto con checkout.session.completed)
    const exists = await tx.payment.findUnique({ where: { stripePaymentId: paymentIntentId } });
    if (!exists) {
      await tx.payment.create({
        data: {
          subscriptionId: sub.id,
          stripePaymentId: paymentIntentId,
          amount: invoice.amount_paid,
          currency: invoice.currency.toUpperCase(),
          status: 'succeeded',
          description: 'Renovación mensual — TattooFind CR',
        },
      });
    }
  });
}
