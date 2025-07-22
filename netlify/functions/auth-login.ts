import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0CpHBlm2zqaF@ep-nameless-feather-a4dga2p7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  max: 1
});

const db = drizzle(pool);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }

    const [user] = await db.select().from(users).where(eq(users.username, username));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid username or password' })
      };
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: { id: user.id, username: user.username },
        token,
        message: 'Login successful'
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed' })
    };
  }
};