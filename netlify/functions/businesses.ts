import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { businesses } from '../../shared/schema';
import { eq, and, lte } from 'drizzle-orm';

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
      const { category, country, state, maxPrice } = event.queryStringParameters || {};
      
      let query = db.select().from(businesses).where(eq(businesses.isActive, true));
      
      // Add filters if provided
      const conditions = [];
      if (category) conditions.push(eq(businesses.category, category));
      if (country) conditions.push(eq(businesses.country, country));
      if (state) conditions.push(eq(businesses.state, state));
      if (maxPrice) conditions.push(lte(businesses.price, parseInt(maxPrice)));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      
      const result = await db.insert(businesses).values(data).returning();
      
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