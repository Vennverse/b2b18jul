var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  advertisements: () => advertisements,
  businesses: () => businesses,
  franchises: () => franchises,
  inquiries: () => inquiries,
  insertAdvertisementSchema: () => insertAdvertisementSchema,
  insertBusinessSchema: () => insertBusinessSchema,
  insertFranchiseSchema: () => insertFranchiseSchema,
  insertInquirySchema: () => insertInquirySchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  registerSchema: () => registerSchema,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var franchises = pgTable("franchises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  investmentRange: text("investment_range"),
  imageUrl: text("image_url"),
  contactEmail: text("contact_email"),
  investmentMin: integer("investment_min"),
  investmentMax: integer("investment_max"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  price: integer("price"),
  imageUrl: text("image_url"),
  contactEmail: text("contact_email"),
  package: text("package"),
  yearEstablished: text("year_established"),
  employees: text("employees"),
  revenue: text("revenue"),
  reason: text("reason"),
  assets: text("assets"),
  status: text("status").default("pending"),
  paymentStatus: text("payment_status").default("unpaid"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  targetUrl: text("target_url"),
  package: text("package"),
  company: text("company"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  budget: text("budget"),
  status: text("status").default("pending"),
  // pending, active, inactive
  paymentStatus: text("payment_status").default("unpaid"),
  // unpaid, paid, refunded
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  franchiseId: integer("franchise_id"),
  businessId: integer("business_id"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6)
});
var registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6)
});
var insertFranchiseSchema = createInsertSchema(franchises).omit({
  id: true,
  createdAt: true
});
var insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true
});
var insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  createdAt: true
});
var insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;
var DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_0CpHBlm2zqaF@ep-nameless-feather-a4dga2p7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
var pool = new Pool({ connectionString: DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
function parsePriceRange(priceRange) {
  const [minStr, maxStr] = priceRange.split("-");
  if (!minStr || !maxStr) return null;
  const parseAmount = (str) => {
    const numStr = str.replace(/[^0-9]/g, "");
    const num = parseInt(numStr);
    if (str.includes("K")) return num * 1e3;
    if (str.includes("M")) return num * 1e6;
    return num;
  };
  return {
    min: parseAmount(minStr),
    max: parseAmount(maxStr)
  };
}
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getAllFranchises() {
    return await db.select().from(franchises).where(eq(franchises.isActive, true));
  }
  async getFranchiseById(id) {
    const [franchise] = await db.select().from(franchises).where(eq(franchises.id, id));
    return franchise || void 0;
  }
  async searchFranchises(filters) {
    const allFranchises = await this.getAllFranchises();
    return allFranchises.filter((franchise) => {
      if (filters.category && filters.category !== "All Business Categories" && franchise.category !== filters.category) {
        return false;
      }
      if (filters.country && filters.country !== "Any Country" && franchise.country !== filters.country) {
        return false;
      }
      if (filters.state && filters.state !== "Any State" && franchise.state !== filters.state) {
        return false;
      }
      if (filters.priceRange && filters.priceRange !== "Price Range") {
        const selectedRange = parsePriceRange(filters.priceRange);
        if (selectedRange && franchise.investmentMin && franchise.investmentMax) {
          const franchiseMin = franchise.investmentMin;
          const franchiseMax = franchise.investmentMax;
          if (!(franchiseMin <= selectedRange.max && franchiseMax >= selectedRange.min)) {
            return false;
          }
        }
      }
      return true;
    });
  }
  async createFranchise(insertFranchise) {
    const [franchise] = await db.insert(franchises).values(insertFranchise).returning();
    return franchise;
  }
  async getAllFranchisesForAdmin() {
    return await db.select().from(franchises);
  }
  async updateFranchiseStatus(id, isActive) {
    const [franchise] = await db.update(franchises).set({ isActive }).where(eq(franchises.id, id)).returning();
    return franchise || void 0;
  }
  async getAllBusinesses() {
    return await db.select().from(businesses).where(eq(businesses.isActive, true));
  }
  async getAllBusinessesForAdmin() {
    return await db.select().from(businesses);
  }
  async getBusinessById(id) {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business || void 0;
  }
  async searchBusinesses(filters) {
    const allBusinesses = await this.getAllBusinesses();
    return allBusinesses.filter((business) => {
      if (filters.category && filters.category !== "All Business Categories" && business.category !== filters.category) {
        return false;
      }
      if (filters.country && filters.country !== "Any Country" && business.country !== filters.country) {
        return false;
      }
      if (filters.state && filters.state !== "Any State" && business.state !== filters.state) {
        return false;
      }
      if (filters.maxPrice && business.price && business.price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  }
  async createBusiness(insertBusiness) {
    const [business] = await db.insert(businesses).values({
      ...insertBusiness,
      status: "pending",
      paymentStatus: "unpaid",
      isActive: false
    }).returning();
    return business;
  }
  async updateBusinessStatus(id, status, isActive) {
    const updateData = { status };
    if (isActive !== void 0) {
      updateData.isActive = isActive;
    }
    const [business] = await db.update(businesses).set(updateData).where(eq(businesses.id, id)).returning();
    return business || void 0;
  }
  async getAllAdvertisements() {
    return await db.select().from(advertisements).where(eq(advertisements.isActive, true));
  }
  async getAllAdvertisementsForAdmin() {
    return await db.select().from(advertisements);
  }
  async createAdvertisement(insertAd) {
    const [advertisement] = await db.insert(advertisements).values({
      ...insertAd,
      status: "pending",
      paymentStatus: "unpaid",
      isActive: false
    }).returning();
    return advertisement;
  }
  async updateAdvertisementStatus(id, status, isActive) {
    const updateData = { status };
    if (isActive !== void 0) {
      updateData.isActive = isActive;
    }
    const [advertisement] = await db.update(advertisements).set(updateData).where(eq(advertisements.id, id)).returning();
    return advertisement || void 0;
  }
  async getAdvertisementById(id) {
    const [advertisement] = await db.select().from(advertisements).where(eq(advertisements.id, id));
    return advertisement || void 0;
  }
  async getAllInquiries() {
    return await db.select().from(inquiries);
  }
  async createInquiry(insertInquiry) {
    const [inquiry] = await db.insert(inquiries).values(insertInquiry).returning();
    return inquiry;
  }
  async getInquiryById(id) {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry || void 0;
  }
  async updateInquiryStatus(id, status) {
    const [inquiry] = await db.update(inquiries).set({ status }).where(eq(inquiries.id, id)).returning();
    return inquiry || void 0;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import session from "express-session";
import MemoryStore from "memorystore";
var JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
function getSessionConfig() {
  const memoryStore = MemoryStore(session);
  return session({
    store: new memoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    }
  });
}
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const sessionUserId = req.session?.userId;
    let userId = null;
    if (token) {
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    } else if (sessionUserId) {
      userId = sessionUserId;
    }
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const user = await storage.getUser(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or inactive" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
}

// server/routes.ts
async function initializeStripe() {
  if (process.env.STRIPE_SECRET_KEY) {
    const { default: Stripe } = await import("stripe");
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return null;
}
var stripePromise = initializeStripe();
async function registerRoutes(app2) {
  app2.use(getSessionConfig());
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this username" });
      }
      const hashedPassword = await hashPassword(validatedData.password);
      const newUser = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword
      });
      const token = generateToken(newUser.id);
      req.session.userId = newUser.id;
      const { password, ...userWithoutPassword } = newUser;
      res.json({
        user: userWithoutPassword,
        token,
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      const isValidPassword = await verifyPassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      const token = generateToken(user.id);
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  app2.get("/api/franchises", async (req, res) => {
    try {
      const franchises2 = await storage.getAllFranchises();
      res.json(franchises2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch franchises" });
    }
  });
  app2.get("/api/franchises/search", async (req, res) => {
    try {
      const { category, country, state, priceRange } = req.query;
      const franchises2 = await storage.searchFranchises({
        category,
        country,
        state,
        priceRange
      });
      res.json(franchises2);
    } catch (error) {
      res.status(500).json({ error: "Failed to search franchises" });
    }
  });
  app2.get("/api/franchises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const franchise = await storage.getFranchiseById(id);
      if (!franchise) {
        return res.status(404).json({ error: "Franchise not found" });
      }
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch franchise" });
    }
  });
  app2.get("/api/admin/franchises", async (req, res) => {
    try {
      const franchises2 = await storage.getAllFranchisesForAdmin();
      console.log(`\u{1F4CA} ADMIN: Retrieved ${franchises2.length} franchises`);
      res.json(franchises2);
    } catch (error) {
      console.error("Error fetching franchises for admin:", error);
      res.status(500).json({ error: "Failed to fetch franchises" });
    }
  });
  app2.patch("/api/franchises/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean value" });
      }
      const franchise = await storage.updateFranchiseStatus(id, isActive);
      if (!franchise) {
        return res.status(404).json({ error: "Franchise not found" });
      }
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ error: "Failed to update franchise status" });
    }
  });
  app2.post("/api/franchises", async (req, res) => {
    try {
      const validatedData = insertFranchiseSchema.parse(req.body);
      const franchise = await storage.createFranchise(validatedData);
      res.status(201).json(franchise);
    } catch (error) {
      res.status(400).json({ error: "Invalid franchise data" });
    }
  });
  app2.get("/api/businesses", async (req, res) => {
    try {
      const businesses2 = await storage.getAllBusinesses();
      res.json(businesses2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });
  app2.get("/api/businesses/search", async (req, res) => {
    try {
      const { category, country, state, maxPrice } = req.query;
      const businesses2 = await storage.searchBusinesses({
        category,
        country,
        state,
        maxPrice: maxPrice ? parseInt(maxPrice) : void 0
      });
      res.json(businesses2);
    } catch (error) {
      res.status(500).json({ error: "Failed to search businesses" });
    }
  });
  app2.get("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const business = await storage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business" });
    }
  });
  app2.post("/api/businesses", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertBusinessSchema.parse(req.body);
      const businessData = {
        ...validatedData,
        userId
      };
      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      console.error("Business creation error:", error);
      res.status(400).json({ error: "Invalid business data" });
    }
  });
  app2.patch("/api/businesses/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = parseInt(req.params.id);
      const existingBusiness = await storage.getBusinessById(businessId);
      if (!existingBusiness) {
        return res.status(404).json({ error: "Business not found" });
      }
      if (existingBusiness.userId !== userId) {
        return res.status(403).json({ error: "You can only edit your own businesses" });
      }
      const updateSchema = insertBusinessSchema.omit({ userId: true }).partial();
      const validatedData = updateSchema.parse(req.body);
      const updatedBusiness = await storage.updateBusiness(businessId, validatedData);
      if (!updatedBusiness) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Business update error:", error);
      res.status(400).json({ error: "Invalid business data" });
    }
  });
  app2.get("/api/admin/businesses", async (req, res) => {
    try {
      const businesses2 = await storage.getAllBusinessesForAdmin();
      console.log(`\u{1F4CA} ADMIN: Retrieved ${businesses2.length} businesses`);
      res.json(businesses2);
    } catch (error) {
      console.error("Error fetching businesses for admin:", error);
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });
  app2.patch("/api/businesses/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, isActive } = req.body;
      if (!["pending", "active", "inactive"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const business = await storage.updateBusinessStatus(id, status, isActive);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ error: "Failed to update business status" });
    }
  });
  app2.get("/api/advertisements", async (req, res) => {
    try {
      const ads = await storage.getAllAdvertisements();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });
  app2.post("/api/advertisements", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertAdvertisementSchema.parse(req.body);
      const advertisementData = {
        ...validatedData,
        userId
      };
      const advertisement = await storage.createAdvertisement(advertisementData);
      res.status(201).json(advertisement);
    } catch (error) {
      console.error("Advertisement creation error:", error);
      res.status(400).json({ error: "Invalid advertisement data" });
    }
  });
  app2.patch("/api/advertisements/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const advertisementId = parseInt(req.params.id);
      const existingAd = await storage.getAdvertisementById(advertisementId);
      if (!existingAd) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      if (existingAd.userId !== userId) {
        return res.status(403).json({ error: "You can only edit your own advertisements" });
      }
      const updateSchema = insertAdvertisementSchema.omit({ userId: true }).partial();
      const validatedData = updateSchema.parse(req.body);
      const updatedAd = await storage.updateAdvertisement(advertisementId, validatedData);
      if (!updatedAd) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      res.json(updatedAd);
    } catch (error) {
      console.error("Advertisement update error:", error);
      res.status(400).json({ error: "Invalid advertisement data" });
    }
  });
  app2.get("/api/admin/advertisements", async (req, res) => {
    try {
      const ads = await storage.getAllAdvertisementsForAdmin();
      console.log(`\u{1F4CA} ADMIN: Retrieved ${ads.length} advertisements`);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching advertisements for admin:", error);
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });
  app2.patch("/api/advertisements/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, isActive } = req.body;
      if (!["pending", "active", "inactive"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const advertisement = await storage.updateAdvertisementStatus(id, status, isActive);
      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      res.json(advertisement);
    } catch (error) {
      res.status(500).json({ error: "Failed to update advertisement status" });
    }
  });
  app2.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries2 = await storage.getAllInquiries();
      console.log(`\u{1F4CA} ADMIN: Retrieved ${inquiries2.length} inquiries`);
      res.json(inquiries2);
    } catch (error) {
      console.error("Error fetching inquiries for admin:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });
  app2.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(400).json({ error: "Invalid inquiry data" });
    }
  });
  app2.get("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.getInquiryById(id);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiry" });
    }
  });
  app2.patch("/api/inquiries/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!["pending", "replied", "closed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const inquiry = await storage.updateInquiryStatus(id, status);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inquiry status" });
    }
  });
  app2.post("/api/franchises/:id/inquire", async (req, res) => {
    try {
      const franchiseId = parseInt(req.params.id);
      const { name, email, phone, message } = req.body;
      const inquiry = await storage.createInquiry({
        name,
        email,
        phone,
        subject: "Franchise Inquiry",
        message,
        franchiseId,
        status: "pending"
      });
      res.json({
        success: true,
        message: "Inquiry submitted successfully. We will contact you within 24 hours.",
        inquiryId: inquiry.id
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });
  app2.post("/api/businesses/:id/inquire", async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const { name, email, phone, message } = req.body;
      const inquiry = await storage.createInquiry({
        name,
        email,
        phone,
        subject: "Business Inquiry",
        message,
        businessId,
        status: "pending"
      });
      res.json({
        success: true,
        message: "Inquiry submitted successfully. We will contact you within 24 hours.",
        inquiryId: inquiry.id
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      const inquiry = await storage.createInquiry({
        name,
        email,
        phone,
        subject,
        message,
        status: "pending"
      });
      res.json({
        success: true,
        message: "Message sent successfully. We will respond within 24 hours.",
        inquiryId: inquiry.id
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    const stripe = await stripePromise;
    if (!stripe) {
      return res.status(503).json({ error: "Payment service not configured" });
    }
    try {
      const { amount, description = "B2B Market Service" } = req.body;
      if (!amount || amount < 1) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "usd",
        description,
        automatic_payment_methods: {
          enabled: true
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Payment intent creation failed:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  app2.post("/api/create-subscription", async (req, res) => {
    const stripe = await stripePromise;
    if (!stripe) {
      return res.status(503).json({ error: "Payment service not configured" });
    }
    try {
      const { priceId, customerEmail, customerName } = req.body;
      if (!priceId || !customerEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName
      });
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"]
      });
      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      });
    } catch (error) {
      console.error("Subscription creation failed:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
if (!process.env.SENDGRID_API_KEY) {
  process.env.SENDGRID_API_KEY = "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";
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
