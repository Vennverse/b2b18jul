import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ws from 'ws';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0CpHBlm2zqaF@ep-nameless-feather-a4dga2p7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  max: 1 // Keep connections minimal for serverless
});

const db = drizzle(pool);

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

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

  const path = event.path.replace('/.netlify/functions/auth', '');

  try {
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');

      // Login endpoint
      if (path === '/login') {
        const { username, password } = data;
        
        const [user] = await db.select().from(users).where(eq(users.username, username));
        
        if (!user || !await bcrypt.compare(password, user.password)) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid credentials' }),
          };
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            user: { id: user.id, username: user.username },
            token,
            message: 'Login successful'
          }),
        };
      }

      // Register endpoint
      if (path === '/register') {
        const { username, password } = data;
        
        // Check if user exists
        const [existingUser] = await db.select().from(users).where(eq(users.username, username));
        
        if (existingUser) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'User already exists' }),
          };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [newUser] = await db.insert(users).values({
          username,
          password: hashedPassword,
        }).returning();

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '24h' });
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            user: { id: newUser.id, username: newUser.username },
            token,
            message: 'Registration successful'
          }),
        };
      }
    }

    if (event.httpMethod === 'GET') {
      // Me endpoint
      if (path === '/me') {
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' }),
          };
        }

        const token = authHeader.substring(7);
        
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));
          
          if (!user) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'User not found' }),
            };
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              id: user.id,
              username: user.username
            }),
          };
        } catch (error) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid token' }),
          };
        }
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };

  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};