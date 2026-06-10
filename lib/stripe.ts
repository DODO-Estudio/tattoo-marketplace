import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Precio en colones (Stripe maneja centavos → acá 1 colón = 1 unidad porque CRC no tiene centavos)
export const PRICES = {
  launch: process.env.STRIPE_PRICE_ID_2500!, // ₡2,500/mes — primeros 3 meses
  regular: process.env.STRIPE_PRICE_ID_5000!, // ₡5,000/mes — precio normal
} as const;
