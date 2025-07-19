import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { businesses } from '../../shared/schema';
import { eq, and, lte } from 'drizzle-orm';
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod === 'GET') {
      const { category, country, state, maxPrice } = event.queryStringParameters || {};
      
      // Use raw SQL to match your exact database schema
      let sql = 'SELECT * FROM businesses WHERE is_active = true';
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
      if (maxPrice) {
        conditions.push(`price <= $${params.length + 1}`);
        params.push(parseInt(maxPrice));
      }
      
      if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
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