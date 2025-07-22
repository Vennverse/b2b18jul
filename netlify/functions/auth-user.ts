import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import jwt from 'jsonwebtoken';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0CpHBlm2zqaF@ep-nameless-feather-a4dga2p7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  max: 1 // Keep connections minimal for serverless
});

const db = drizzle(pool);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const authorization = event.headers.authorization || event.headers.Authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No valid authorization token provided' })
      };
    }

    const token = authorization.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: user.id, username: user.username })
    };
  } catch (error) {
    console.error('Auth user function error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }
};