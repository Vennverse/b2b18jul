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
    let query = db.select().from(franchises).where(eq(franchises.isActive, true));
    
    // Note: For a production app, you would add proper WHERE clauses for filtering
    // This is a simplified implementation
    const allFranchises = await query;
    
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
      if (filters.priceRange && filters.priceRange !== "Price Range" && franchise.priceRange !== filters.priceRange) {
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
    let query = db.select().from(businesses).where(eq(businesses.isActive, true));
    
    // Note: For a production app, you would add proper WHERE clauses for filtering
    // This is a simplified implementation
    const allBusinesses = await query;
    
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
        priceRange: "$50K-$100K",
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
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
        priceRange: "$250K-$500K",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        investmentMin: 1421257,
        investmentMax: 1497104,
        isActive: true,
      },
      {
        name: "College Hunks Hauling Junk and Moving",
        description: "Professional moving and junk removal services",
        category: "Moving Services",
        country: "USA",
        state: "Florida",
        priceRange: "$100K-$250K",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        investmentMin: 100000,
        investmentMax: 250000,
        isActive: true,
      },
      {
        name: "Home Team Inspection Service",
        description: "Professional home inspection services",
        category: "Real Estate",
        country: "USA",
        state: "New York",
        priceRange: "$50K-$100K",
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        investmentMin: 50000,
        investmentMax: 100000,
        isActive: true,
      },
      {
        name: "Mr. Handyman",
        description: "Home repair and maintenance services",
        category: "Maintenance",
        country: "USA",
        state: "Illinois",
        priceRange: "$100K-$250K",
        imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        investmentMin: 100000,
        investmentMax: 250000,
        isActive: true,
      },
      {
        name: "Mr. Rooter Plumbing",
        description: "Professional plumbing services",
        category: "Repair & Restoration",
        country: "USA",
        state: "Ohio",
        priceRange: "$100K-$250K",
        imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        investmentMin: 100000,
        investmentMax: 250000,
        isActive: true,
      },
      {
        name: "My Salon Suite",
        description: "Upscale salon suites for beauty professionals",
        category: "Health, Beauty & Nutrition",
        country: "USA",
        state: "Georgia",
        priceRange: "$250K-$500K",
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        investmentMin: 250000,
        investmentMax: 500000,
        isActive: true,
      },
      {
        name: "Sport Clips",
        description: "Sports-themed hair salon franchise",
        category: "Hairstyling",
        country: "USA",
        state: "Arizona",
        priceRange: "$250K-$500K",
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        investmentMin: 250000,
        investmentMax: 500000,
        isActive: true,
      },
    ];

    sampleFranchises.forEach(franchise => {
      this.createFranchise(franchise);
    });

    // Sample businesses
    const sampleBusinesses: InsertBusiness[] = [
      {
        name: "TechFlow Solutions",
        description: "Established software development company specializing in web applications and mobile solutions. Strong client base and recurring revenue.",
        category: "technology",
        country: "USA",
        state: "California",
        price: 850000,
        contactEmail: "seller@techflow.com",
        isActive: true,
      },
      {
        name: "Golden Gate Restaurant",
        description: "Popular family restaurant in prime location. Fully equipped kitchen, established customer base, and excellent reviews.",
        category: "restaurant",
        country: "USA",
        state: "California",
        price: 450000,
        contactEmail: "owner@goldengate.com",
        isActive: true,
      },
      {
        name: "Metro Fitness Center",
        description: "Well-equipped gym with modern facilities, personal training services, and loyal membership base of 800+ members.",
        category: "services",
        country: "USA",
        state: "New York",
        price: 320000,
        contactEmail: "manager@metrofitness.com",
        isActive: true,
      },
      {
        name: "Sunshine Medical Clinic",
        description: "Family practice clinic with established patient base. Modern equipment and prime location in growing community.",
        category: "healthcare",
        country: "USA",
        state: "Florida",
        price: 1200000,
        contactEmail: "admin@sunshinemedical.com",
        isActive: true,
      },
      {
        name: "Downtown Auto Repair",
        description: "Full-service automotive repair shop with loyal customer base. All equipment included, excellent reputation.",
        category: "services",
        country: "USA",
        state: "Texas",
        price: 275000,
        contactEmail: "owner@downtownauto.com",
        isActive: true,
      },
      {
        name: "Fresh Market Grocery",
        description: "Neighborhood grocery store with steady revenue. Prime location, established supplier relationships, and growth potential.",
        category: "retail",
        country: "USA",
        state: "Colorado",
        price: 680000,
        contactEmail: "manager@freshmarket.com",
        isActive: true,
      },
    ];

    sampleBusinesses.forEach(business => {
      this.createBusiness(business);
    });

    // Sample advertisements
    const sampleAds: InsertAdvertisement[] = [
      {
        title: "Business Meeting Solutions",
        imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        targetUrl: "#",
        isActive: true,
      },
      {
        title: "Corporate Partnership Opportunities",
        imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        targetUrl: "#",
        isActive: true,
      },
      {
        title: "Business Strategy Consulting",
        imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        targetUrl: "#",
        isActive: true,
      },
    ];

    sampleAds.forEach(ad => {
      this.createAdvertisement(ad);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
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
      if (filters.priceRange && filters.priceRange !== "Price Range" && franchise.priceRange !== filters.priceRange) {
        return false;
      }
      return true;
    });
  }

  async createFranchise(insertFranchise: InsertFranchise): Promise<Franchise> {
    const id = this.currentFranchiseId++;
    const franchise: Franchise = {
      ...insertFranchise,
      id,
      createdAt: new Date(),
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
      ...insertBusiness,
      id,
      createdAt: new Date(),
    };
    this.businesses.set(id, business);
    return business;
  }

  async getAllAdvertisements(): Promise<Advertisement[]> {
    return Array.from(this.advertisements.values()).filter(a => a.isActive);
  }

  async createAdvertisement(insertAd: InsertAdvertisement): Promise<Advertisement> {
    const id = this.currentAdId++;
    const ad: Advertisement = {
      ...insertAd,
      id,
      createdAt: new Date(),
    };
    this.advertisements.set(id, ad);
    return ad;
  }
}

export const storage = new DatabaseStorage();
