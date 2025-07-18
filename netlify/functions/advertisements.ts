import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { advertisements } from '../../shared/schema';
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod === 'GET') {
      const result = await db.select().from(advertisements).where(eq(advertisements.isActive, true));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      
      const result = await db.insert(advertisements).values(data).returning();
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result[0]),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
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