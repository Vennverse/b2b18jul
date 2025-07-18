import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import MemoryStore from 'memorystore';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// JWT Secret - in production this should be from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Session configuration
export function getSessionConfig() {
  // Use memory store for development to avoid database session issues
  const memoryStore = MemoryStore(session);
  
  return session({
    store: new memoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

// Auth middleware
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    // Check session for user ID
    const sessionUserId = (req.session as any)?.userId;

    let userId: number | null = null;

    if (token) {
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    } else if (sessionUserId) {
      userId = sessionUserId;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from database
    const user = await storage.getUser(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Optional auth middleware (doesn't require auth but adds user if available)
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    const sessionUserId = (req.session as any)?.userId;

    let userId: number | null = null;

    if (token) {
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    } else if (sessionUserId) {
      userId = sessionUserId;
    }

    if (userId) {
      const user = await storage.getUser(userId);
      if (user && user.isActive) {
        (req as any).user = user;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without auth
  }
}

// Admin middleware - requires authentication and admin role
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, (err?: any) => {
    if (err) return next(err);
    
    const user = (req as any).user;
    
    // Enhanced logging for security monitoring
    if (!user) {
      console.warn(`🚨 SECURITY: Admin access attempt with no user context from IP: ${req.ip || req.socket.remoteAddress}`);
      return res.status(403).json({ error: "Admin access required" });
    }
    
    if (user.role !== "admin") {
      console.warn(`🚨 SECURITY: Non-admin user ${user.email} (ID: ${user.id}) attempted admin access from IP: ${req.ip || req.socket.remoteAddress}`);
      return res.status(403).json({ error: "Admin access required" });
    }
    
    // Log successful admin access
    console.log(`✅ ADMIN ACCESS: User ${user.email} (ID: ${user.id}) accessed admin endpoint: ${req.method} ${req.path}`);
    
    next();
  });
}