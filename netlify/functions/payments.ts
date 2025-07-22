import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      
      if (event.path.includes('create-payment-intent')) {
        const { amount, currency = 'usd', metadata = {} } = body;

        if (!amount || amount < 50) { // Stripe minimum is $0.50
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Amount must be at least $0.50' })
          };
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
          })
        };
      }

      if (event.path.includes('create-subscription')) {
        const { priceId, customerId } = body;

        if (!priceId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Price ID is required' })
          };
        }

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
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
          })
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Payment function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};