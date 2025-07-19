import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { franchises } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import ws from 'ws';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0CpHBlm2zqaF@ep-nameless-feather-a4dga2p7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
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
      
      // Use raw SQL to match your exact database schema
      let sql = isAdminRequest 
        ? 'SELECT * FROM franchises' // Admin sees all franchises
        : 'SELECT * FROM franchises WHERE is_active = true'; // Public sees only active
      
      const conditions = [];
      const params = [];
      
      if (category) {
        conditions.push(`category = $${params.length + 1}`);
        params.push(category);
      }
      if (country) {
        conditions.push(`country = $${params.length + 1}`);
        params.push(country);
      }
      if (state) {
        conditions.push(`state = $${params.length + 1}`);
        params.push(state);
      }
      
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (min) {
          conditions.push(`investment_min >= $${params.length + 1}`);
          params.push(min);
        }
        if (max) {
          conditions.push(`investment_max <= $${params.length + 1}`);
          params.push(max);
        }
      }
      
      if (conditions.length > 0) {
        sql += (isAdminRequest ? ' WHERE ' : ' AND ') + conditions.join(' AND ');
      }
      
      const result = await pool.query(sql, params);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows),
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