import { 
  users, franchises, businesses, advertisements, inquiries,
  type User, type InsertUser,
  type Franchise, type InsertFranchise,
  type Business, type InsertBusiness,
  type Advertisement, type InsertAdvertisement,
  type Inquiry, type InsertInquiry
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllFranchises(): Promise<Franchise[]>;
  getFranchiseById(id: number): Promise<Franchise | undefined>;
  searchFranchises(filters: {
    category?: string;
    country?: string;
    state?: string;
    priceRange?: string;
  }): Promise<Franchise[]>;
  createFranchise(franchise: InsertFranchise): Promise<Franchise>;
  
  getAllBusinesses(): Promise<Business[]>;
  getBusinessById(id: number): Promise<Business | undefined>;
  searchBusinesses(filters: {
    category?: string;
    country?: string;
    state?: string;
    maxPrice?: number;
  }): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  
  getAllAdvertisements(): Promise<Advertisement[]>;
  createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  
  getAllInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiryById(id: number): Promise<Inquiry | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllFranchises(): Promise<Franchise[]> {
    return await db.select().from(franchises).where(eq(franchises.isActive, true));
  }

  async getFranchiseById(id: number): Promise<Franchise | undefined> {
    const [franchise] = await db.select().from(franchises).where(eq(franchises.id, id));
    return franchise || undefined;
  }

  async searchFranchises(filters: {
    category?: string;
    country?: string;
    state?: string;
    priceRange?: string;
  }): Promise<Franchise[]> {
    const allFranchises = await this.getAllFranchises();
    return allFranchises.filter(franchise => {
      if (filters.category && filters.category !== "All Business Categories" && franchise.category !== filters.category) {
        return false;
      }
      if (filters.country && filters.country !== "Any Country" && franchise.country !== filters.country) {
        return false;
      }
      if (filters.state && filters.state !== "Any State" && franchise.state !== filters.state) {
        return false;
      }
      if (filters.priceRange && filters.priceRange !== "Price Range" && franchise.investmentRange !== filters.priceRange) {
        return false;
      }
      return true;
    });
  }

  async createFranchise(insertFranchise: InsertFranchise): Promise<Franchise> {
    const [franchise] = await db
      .insert(franchises)
      .values(insertFranchise)
      .returning();
    return franchise;
  }

  async getAllBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses).where(eq(businesses.isActive, true));
  }

  async getBusinessById(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business || undefined;
  }

  async searchBusinesses(filters: {
    category?: string;
    country?: string;
    state?: string;
    maxPrice?: number;
  }): Promise<Business[]> {
    const allBusinesses = await this.getAllBusinesses();
    return allBusinesses.filter(business => {
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

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const [business] = await db
      .insert(businesses)
      .values(insertBusiness)
      .returning();
    return business;
  }

  async getAllAdvertisements(): Promise<Advertisement[]> {
    return await db.select().from(advertisements).where(eq(advertisements.isActive, true));
  }

  async createAdvertisement(insertAd: InsertAdvertisement): Promise<Advertisement> {
    const [ad] = await db
      .insert(advertisements)
      .values(insertAd)
      .returning();
    return ad;
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries);
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values(insertInquiry)
      .returning();
    return inquiry;
  }

  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry || undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private franchises: Map<number, Franchise>;
  private businesses: Map<number, Business>;
  private advertisements: Map<number, Advertisement>;
  private inquiries: Map<number, Inquiry>;
  private currentUserId: number;
  private currentFranchiseId: number;
  private currentBusinessId: number;
  private currentAdId: number;
  private currentInquiryId: number;

  constructor() {
    this.users = new Map();
    this.franchises = new Map();
    this.businesses = new Map();
    this.advertisements = new Map();
    this.inquiries = new Map();
    this.currentUserId = 1;
    this.currentFranchiseId = 1;
    this.currentBusinessId = 1;
    this.currentAdId = 1;
    this.currentInquiryId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample franchises
    const sampleFranchises: InsertFranchise[] = [
      {
        name: "MILKSTER",
        description: "Premium coffee franchise with specialty drinks",
        category: "Coffee",
        country: "USA",
        state: "California",
        investmentRange: "$50K-$100K",
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "info@milkster.com",
        investmentMin: 50000,
        investmentMax: 100000,
        isActive: true,
      },
      {
        name: "BrightStar Care",
        description: "Healthcare and senior care services",
        category: "Health, Beauty & Nutrition",
        country: "USA",
        state: "Texas",
        investmentRange: "$250K-$500K",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "franchise@brightstarcare.com",
        investmentMin: 250000,
        investmentMax: 500000,
        isActive: true,
      },
      {
        name: "College Hunks Hauling Junk and Moving",
        description: "Professional moving and junk removal services",
        category: "Moving Services",
        country: "USA",
        state: "Florida",
        investmentRange: "$100K-$250K",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "franchise@collegehunks.com",
        investmentMin: 100000,
        investmentMax: 250000,
        isActive: true,
      },
      {
        name: "Home Team Inspection Service",
        description: "Professional home inspection services",
        category: "Home & Garden",
        country: "USA",
        state: "Georgia",
        investmentRange: "$50K-$100K",
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "franchise@hometeam.com",
        investmentMin: 50000,
        investmentMax: 100000,
        isActive: true,
      },
      {
        name: "Mr. Handyman",
        description: "Professional handyman and repair services",
        category: "Home & Garden",
        country: "USA",
        state: "Ohio",
        investmentRange: "$100K-$250K",
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "franchise@mrhandyman.com",
        investmentMin: 100000,
        investmentMax: 250000,
        isActive: true,
      },
      {
        name: "Mr. Rooter Plumbing",
        description: "Professional plumbing services",
        category: "Home & Garden",
        country: "USA",
        state: "Michigan",
        investmentRange: "$250K-$500K",
        imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "franchise@mrrooter.com",
        investmentMin: 250000,
        investmentMax: 500000,
        isActive: true,
      },
      {
        name: "Sport Clips",
        description: "Men's hair salon franchise",
        category: "Health, Beauty & Nutrition",
        country: "USA",
        state: "Colorado",
        investmentRange: "$100K-$250K",
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "franchise@sportclips.com",
        investmentMin: 100000,
        investmentMax: 250000,
        isActive: true,
      },
      {
        name: "Supercuts",
        description: "Affordable hair salon chain",
        category: "Health, Beauty & Nutrition",
        country: "USA",
        state: "Washington",
        investmentRange: "$100K-$250K",
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "franchise@supercuts.com",
        investmentMin: 100000,
        investmentMax: 250000,
        isActive: true,
      }
    ];

    sampleFranchises.forEach(franchise => {
      this.createFranchise(franchise);
    });

    // Sample businesses
    const sampleBusinesses: InsertBusiness[] = [
      {
        name: "Downtown Coffee Shop",
        description: "Established coffee shop in prime downtown location",
        category: "Food & Beverage",
        country: "USA",
        state: "New York",
        price: 125000,
        imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "seller@downtowncoffee.com",
        isActive: true,
      },
      {
        name: "Tech Consulting Firm",
        description: "Growing IT consulting business with established client base",
        category: "Technology",
        country: "USA",
        state: "California",
        price: 350000,
        imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        contactEmail: "seller@techconsult.com",
        isActive: true,
      }
    ];

    sampleBusinesses.forEach(business => {
      this.createBusiness(business);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password
    };
    this.users.set(id, user);
    return user;
  }

  async getAllFranchises(): Promise<Franchise[]> {
    return Array.from(this.franchises.values()).filter(f => f.isActive);
  }

  async getFranchiseById(id: number): Promise<Franchise | undefined> {
    return this.franchises.get(id);
  }

  async searchFranchises(filters: {
    category?: string;
    country?: string;
    state?: string;
    priceRange?: string;
  }): Promise<Franchise[]> {
    const allFranchises = await this.getAllFranchises();
    return allFranchises.filter(franchise => {
      if (filters.category && filters.category !== "All Business Categories" && franchise.category !== filters.category) {
        return false;
      }
      if (filters.country && filters.country !== "Any Country" && franchise.country !== filters.country) {
        return false;
      }
      if (filters.state && filters.state !== "Any State" && franchise.state !== filters.state) {
        return false;
      }
      if (filters.priceRange && filters.priceRange !== "Price Range" && franchise.investmentRange !== filters.priceRange) {
        return false;
      }
      return true;
    });
  }

  async createFranchise(insertFranchise: InsertFranchise): Promise<Franchise> {
    const id = this.currentFranchiseId++;
    const franchise: Franchise = {
      id,
      name: insertFranchise.name,
      description: insertFranchise.description || null,
      category: insertFranchise.category,
      country: insertFranchise.country,
      state: insertFranchise.state || null,
      investmentRange: insertFranchise.investmentRange || null,
      imageUrl: insertFranchise.imageUrl || null,
      contactEmail: insertFranchise.contactEmail || null,
      investmentMin: insertFranchise.investmentMin || null,
      investmentMax: insertFranchise.investmentMax || null,
      isActive: insertFranchise.isActive ?? true,
      createdAt: new Date()
    };
    this.franchises.set(id, franchise);
    return franchise;
  }

  async getAllBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values()).filter(b => b.isActive);
  }

  async getBusinessById(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async searchBusinesses(filters: {
    category?: string;
    country?: string;
    state?: string;
    maxPrice?: number;
  }): Promise<Business[]> {
    const allBusinesses = await this.getAllBusinesses();
    return allBusinesses.filter(business => {
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

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.currentBusinessId++;
    const business: Business = {
      id,
      name: insertBusiness.name,
      description: insertBusiness.description || null,
      category: insertBusiness.category,
      country: insertBusiness.country,
      state: insertBusiness.state || null,
      price: insertBusiness.price || null,
      imageUrl: insertBusiness.imageUrl || null,
      contactEmail: insertBusiness.contactEmail || null,
      isActive: insertBusiness.isActive ?? true,
      createdAt: new Date()
    };
    this.businesses.set(id, business);
    return business;
  }

  async getAllAdvertisements(): Promise<Advertisement[]> {
    return Array.from(this.advertisements.values()).filter(ad => ad.isActive);
  }

  async createAdvertisement(insertAd: InsertAdvertisement): Promise<Advertisement> {
    const id = this.currentAdId++;
    const ad: Advertisement = {
      id,
      title: insertAd.title,
      imageUrl: insertAd.imageUrl,
      targetUrl: insertAd.targetUrl || null,
      isActive: insertAd.isActive ?? true,
      createdAt: new Date()
    };
    this.advertisements.set(id, ad);
    return ad;
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.currentInquiryId++;
    const inquiry: Inquiry = {
      id,
      name: insertInquiry.name,
      email: insertInquiry.email,
      phone: insertInquiry.phone || null,
      subject: insertInquiry.subject,
      message: insertInquiry.message,
      franchiseId: insertInquiry.franchiseId || null,
      businessId: insertInquiry.businessId || null,
      status: insertInquiry.status || "pending",
      createdAt: new Date()
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }
}

export const storage = new DatabaseStorage();