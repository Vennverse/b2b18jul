import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFranchiseSchema, insertBusinessSchema, insertInquirySchema, insertAdvertisementSchema, loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import crypto from "crypto";
import { getSessionConfig, hashPassword, verifyPassword, generateToken, requireAuth, optionalAuth, requireAdmin } from "./auth";
import { sendEmail, createPasswordResetEmail } from "./emailService";
import { MailService } from '@sendgrid/mail';

// Initialize Stripe
async function initializeStripe() {
  if (process.env.STRIPE_SECRET_KEY) {
    const { default: Stripe } = await import('stripe');
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return null;
}

const stripePromise = initializeStripe();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(getSessionConfig());

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const newUser = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      });

      // Generate token and set session
      const token = generateToken(newUser.id);
      (req.session as any).userId = newUser.id;

      // Return user info (without password)
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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: "Account is inactive" });
      }

      // Generate token and set session
      const token = generateToken(user.id);
      (req.session as any).userId = user.id;

      // Return user info (without password)
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

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = (req as any).user;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account with that email exists, we've sent a password reset link." });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      // Store reset token
      await storage.createPasswordResetToken(email, resetToken, expiresAt);

      // Create and send password reset email
      const emailOptions = createPasswordResetEmail(email, resetToken);
      const emailSent = await sendEmail(emailOptions);

      if (emailSent) {
        res.json({ 
          message: "Password reset email sent successfully! Check your inbox for the reset link.",
          success: true
        });
      } else {
        // Email failed but provide direct reset link for development/testing
        res.json({ 
          message: "Password reset link generated. Since email delivery is not configured, you can reset your password directly using the link below:",
          resetLink: `http://localhost:5000/reset-password?token=${resetToken}`,
          success: true,
          token: resetToken,
          instructions: "Click the reset link above or copy it to your browser to reset your password."
        });
      }

    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(400).json({ error: "Failed to process request" });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      // Get reset token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken || resetToken.used) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      // Check if token has expired
      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ error: "Reset token has expired" });
      }

      // Hash new password and update user
      const hashedPassword = await hashPassword(password);
      const updatedUser = await storage.updateUserPassword(resetToken.email, hashedPassword);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Mark token as used
      await storage.markPasswordResetTokenUsed(token);

      res.json({ message: "Password reset successful" });

    } catch (error) {
      console.error("Reset password error:", error);
      res.status(400).json({ error: "Failed to reset password" });
    }
  });

  // User dashboard routes
  app.get("/api/user/businesses", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const businesses = await storage.getUserBusinesses(userId);
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user businesses" });
    }
  });

  app.get("/api/user/advertisements", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const advertisements = await storage.getUserAdvertisements(userId);
      res.json(advertisements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user advertisements" });
    }
  });

  // Franchise routes
  app.get("/api/franchises", async (req, res) => {
    try {
      const franchises = await storage.getAllFranchises();
      res.json(franchises);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch franchises" });
    }
  });

  app.get("/api/franchises/search", async (req, res) => {
    try {
      const { category, country, state, priceRange } = req.query;
      const franchises = await storage.searchFranchises({
        category: category as string,
        country: country as string,
        state: state as string,
        priceRange: priceRange as string,
      });
      res.json(franchises);
    } catch (error) {
      res.status(500).json({ error: "Failed to search franchises" });
    }
  });

  app.get("/api/franchises/:id", async (req, res) => {
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

  app.post("/api/franchises", async (req, res) => {
    try {
      const validatedData = insertFranchiseSchema.parse(req.body);
      const franchise = await storage.createFranchise(validatedData);
      res.status(201).json(franchise);
    } catch (error) {
      res.status(400).json({ error: "Invalid franchise data" });
    }
  });

  // Business routes
  app.get("/api/businesses", async (req, res) => {
    try {
      const businesses = await storage.getAllBusinesses();
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  app.get("/api/businesses/search", async (req, res) => {
    try {
      const { category, country, state, maxPrice } = req.query;
      const businesses = await storage.searchBusinesses({
        category: category as string,
        country: country as string,
        state: state as string,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
      });
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to search businesses" });
    }
  });

  app.get("/api/businesses/:id", async (req, res) => {
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

  app.post("/api/businesses", async (req, res) => {
    try {
      const validatedData = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness(validatedData);
      res.status(201).json(business);
    } catch (error) {
      console.error("Business creation error:", error);
      res.status(400).json({ error: "Invalid business data" });
    }
  });

  // Admin endpoint to get all businesses including pending ones
  app.get("/api/admin/businesses", requireAdmin, async (req, res) => {
    try {
      const businesses = await storage.getAllBusinessesForAdmin();
      console.log(`📊 ADMIN: ${(req as any).user.email} retrieved ${businesses.length} businesses`);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses for admin:", error);
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  // Admin endpoint to update business status
  app.patch("/api/businesses/:id/status", requireAdmin, async (req, res) => {
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

  // Advertisement routes
  app.get("/api/advertisements", async (req, res) => {
    try {
      const ads = await storage.getAllAdvertisements();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });

  app.post("/api/advertisements", async (req, res) => {
    try {
      const validatedData = insertAdvertisementSchema.parse(req.body);
      const advertisement = await storage.createAdvertisement(validatedData);
      res.status(201).json(advertisement);
    } catch (error) {
      console.error("Advertisement creation error:", error);
      res.status(400).json({ error: "Invalid advertisement data" });
    }
  });

  // Admin endpoint to get all advertisements including pending ones
  app.get("/api/admin/advertisements", requireAdmin, async (req, res) => {
    try {
      const ads = await storage.getAllAdvertisementsForAdmin();
      console.log(`📊 ADMIN: ${(req as any).user.email} retrieved ${ads.length} advertisements`);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching advertisements for admin:", error);
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });

  // Admin endpoint to update advertisement status
  app.patch("/api/advertisements/:id/status", requireAdmin, async (req, res) => {
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

  // Inquiry routes (Admin-only access)
  app.get("/api/inquiries", requireAdmin, async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      console.log(`📊 ADMIN: ${(req as any).user.email} retrieved ${inquiries.length} inquiries`);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries for admin:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(400).json({ error: "Invalid inquiry data" });
    }
  });

  app.get("/api/inquiries/:id", async (req, res) => {
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

  app.patch("/api/inquiries/:id/status", requireAdmin, async (req, res) => {
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

  // Franchise inquiry endpoint
  app.post("/api/franchises/:id/inquire", async (req, res) => {
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

  // Business inquiry endpoint
  app.post("/api/businesses/:id/inquire", async (req, res) => {
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

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
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

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
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
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        description,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Payment intent creation failed:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  app.post("/api/create-subscription", async (req, res) => {
    const stripe = await stripePromise;
    if (!stripe) {
      return res.status(503).json({ error: "Payment service not configured" });
    }

    try {
      const { priceId, customerEmail, customerName } = req.body;
      
      if (!priceId || !customerEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Subscription creation failed:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
