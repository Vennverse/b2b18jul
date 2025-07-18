import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const path = event.path.replace('/.netlify/functions/payments', '');

  try {
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');

      // Create payment intent
      if (path === '/create-payment-intent') {
        const { amount, currency = 'usd' } = data;
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            clientSecret: paymentIntent.client_secret,
          }),
        };
      }

      // Create subscription
      if (path === '/create-subscription') {
        const { priceId, customerId } = data;
        
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
          }),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};