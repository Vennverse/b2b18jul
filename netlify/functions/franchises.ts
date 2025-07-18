import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { franchises } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

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
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod === 'GET') {
      const { category, country, state, priceRange } = event.queryStringParameters || {};
      
      // Check if this is an admin request (looking for /api/admin/franchises)
      const isAdminRequest = event.path.includes('/admin/franchises');
      
      let query = isAdminRequest 
        ? db.select().from(franchises) // Admin sees all franchises
        : db.select().from(franchises).where(eq(franchises.isActive, true)); // Public sees only active
      
      // Add filters if provided
      const conditions = [];
      if (category) conditions.push(eq(franchises.category, category));
      if (country) conditions.push(eq(franchises.country, country));
      if (state) conditions.push(eq(franchises.state, state));
      
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (min) conditions.push(gte(franchises.investmentMin, min));
        if (max) conditions.push(lte(franchises.investmentMax, max));
      }
      
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
      
      const result = await db.insert(franchises).values(data).returning();
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result[0]),
      };
    }

    if (event.httpMethod === 'PATCH') {
      const pathSegments = event.path.split('/');
      const id = parseInt(pathSegments[pathSegments.length - 2]); // Get ID from path like /api/franchises/1/status
      const action = pathSegments[pathSegments.length - 1]; // Get 'status' from path
      
      if (action === 'status') {
        const { isActive } = JSON.parse(event.body || '{}');
        
        if (typeof isActive !== 'boolean') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'isActive must be a boolean value' }),
          };
        }
        
        const result = await db
          .update(franchises)
          .set({ isActive })
          .where(eq(franchises.id, id))
          .returning();
        
        if (result.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Franchise not found' }),
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result[0]),
        };
      }
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