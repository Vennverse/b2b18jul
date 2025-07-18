import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { inquiries, advertisements, businesses } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1 // Keep connections minimal for serverless
});

const db = drizzle(pool);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const path = event.path.replace('/.netlify/functions/admin', '');

  try {
    if (event.httpMethod === 'GET') {
      if (path === '/inquiries') {
        const result = await db.select().from(inquiries);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }

      if (path === '/advertisements') {
        const result = await db.select().from(advertisements);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }

      if (path === '/businesses') {
        const result = await db.select().from(businesses);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body || '{}');
      const { id, status } = data;

      if (path === '/inquiries/status') {
        await db.update(inquiries)
          .set({ status })
          .where(eq(inquiries.id, id));
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      if (path === '/advertisements/status') {
        const { isActive } = data;
        await db.update(advertisements)
          .set({ status, isActive })
          .where(eq(advertisements.id, id));
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      if (path === '/businesses/status') {
        const { isActive } = data;
        await db.update(businesses)
          .set({ status, isActive })
          .where(eq(businesses.id, id));
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
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