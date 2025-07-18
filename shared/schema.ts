import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // "user" or "admin"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const franchises = pgTable("franchises", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  targetUrl: text("target_url"),
  package: text("package"),
  company: text("company"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  budget: text("budget"),
  status: text("status").default("pending"), // pending, active, inactive
  paymentStatus: text("payment_status").default("unpaid"), // unpaid, paid, refunded
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  franchiseId: integer("franchise_id"),
  businessId: integer("business_id"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  email: true,
  token: true,
  expiresAt: true,
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export const insertFranchiseSchema = createInsertSchema(franchises).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  createdAt: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFranchise = z.infer<typeof insertFranchiseSchema>;
export type Franchise = typeof franchises.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
