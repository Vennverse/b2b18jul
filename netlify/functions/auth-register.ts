import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../../shared/schema';

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

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 6 characters long' })
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ username, password: hashedPassword })
      .returning({ id: users.id, username: users.username });

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: { id: newUser.id, username: newUser.username },
        token,
        message: 'Registration successful'
      })
    };
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username already exists' })
      };
    }

    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Registration failed' })
    };
  }
};