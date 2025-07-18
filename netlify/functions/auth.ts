import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users, passwordResetTokens } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
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
        const { email, password } = data;
        
        const [user] = await db.select().from(users).where(eq(users.email, email));
        
        if (!user || !await bcrypt.compare(password, user.password)) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid credentials' }),
          };
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } }),
        };
      }

      // Register endpoint
      if (path === '/register') {
        const { email, password, firstName, lastName } = data;
        
        // Check if user already exists
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        
        if (existingUser) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({ error: 'User already exists' }),
          };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [newUser] = await db.insert(users).values({
          email,
          password: hashedPassword,
          firstName,
          lastName,
        }).returning();

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ token, user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName } }),
        };
      }

      // Forgot password endpoint
      if (path === '/forgot-password') {
        const { email } = data;
        
        const [user] = await db.select().from(users).where(eq(users.email, email));
        
        if (!user) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'User not found' }),
          };
        }

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await db.insert(passwordResetTokens).values({
          email,
          token,
          expiresAt,
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Reset token generated', token }), // In production, don't return token
        };
      }

      // Reset password endpoint
      if (path === '/reset-password') {
        const { token, password } = data;
        
        const [resetToken] = await db.select().from(passwordResetTokens)
          .where(eq(passwordResetTokens.token, token));
        
        if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid or expired token' }),
          };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.update(users)
          .set({ password: hashedPassword })
          .where(eq(users.email, resetToken.email));

        await db.update(passwordResetTokens)
          .set({ used: true })
          .where(eq(passwordResetTokens.token, token));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Password reset successful' }),
        };
      }
    }

    // Verify token endpoint
    if (event.httpMethod === 'GET' && path === '/verify') {
      const authHeader = event.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'No token provided' }),
        };
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        
        const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));
        
        if (!user) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid token' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } }),
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' }),
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