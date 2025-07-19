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
  getAllFranchisesForAdmin(): Promise<Franchise[]>;
  getFranchiseById(id: number): Promise<Franchise | undefined>;
  searchFranchises(filters: {
    category?: string;
    country?: string;
    state?: string;
    priceRange?: string;
  }): Promise<Franchise[]>;
  createFranchise(franchise: InsertFranchise): Promise<Franchise>;
  updateFranchiseStatus(id: number, isActive: boolean): Promise<Franchise | undefined>;
  
  getAllBusinesses(): Promise<Business[]>;
  getAllBusinessesForAdmin(): Promise<Business[]>;
  getBusinessById(id: number): Promise<Business | undefined>;
  searchBusinesses(filters: {
    category?: string;
    country?: string;
    state?: string;
    maxPrice?: number;
  }): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusinessStatus(id: number, status: string, isActive?: boolean): Promise<Business | undefined>;
  
  getAllAdvertisements(): Promise<Advertisement[]>;
  getAllAdvertisementsForAdmin(): Promise<Advertisement[]>;
  createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisementStatus(id: number, status: string, isActive?: boolean): Promise<Advertisement | undefined>;
  getAdvertisementById(id: number): Promise<Advertisement | undefined>;
  
  getAllInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiryById(id: number): Promise<Inquiry | undefined>;
  updateInquiryStatus(id: number, status: string): Promise<Inquiry | undefined>;
}

function parsePriceRange(priceRange: string): { min: number; max: number } | null {
  // Handle price ranges like "$10K-$50K", "$100K-$250K", "$1M-$5M"
  const [minStr, maxStr] = priceRange.split('-');
  if (!minStr || !maxStr) return null;
  
  const parseAmount = (str: string): number => {
    const numStr = str.replace(/[^0-9]/g, '');
    const num = parseInt(numStr);
    if (str.includes('K')) return num * 1000;
    if (str.includes('M')) return num * 1000000;
    return num;
  };
  
  return {
    min: parseAmount(minStr),
    max: parseAmount(maxStr)
  };
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
      if (filters.priceRange && filters.priceRange !== "Price Range") {
        const selectedRange = parsePriceRange(filters.priceRange);
        if (selectedRange && franchise.investmentMin && franchise.investmentMax) {
          // Check if franchise investment range overlaps with selected range
          const franchiseMin = franchise.investmentMin;
          const franchiseMax = franchise.investmentMax;
          
          // Overlaps if: franchise_min <= selected_max AND franchise_max >= selected_min
          if (!(franchiseMin <= selectedRange.max && franchiseMax >= selectedRange.min)) {
            return false;
          }
        }
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

  async getAllFranchisesForAdmin(): Promise<Franchise[]> {
    return await db.select().from(franchises);
  }

  async updateFranchiseStatus(id: number, isActive: boolean): Promise<Franchise | undefined> {
    const [franchise] = await db
      .update(franchises)
      .set({ isActive })
      .where(eq(franchises.id, id))
      .returning();
    return franchise || undefined;
  }

  async getAllBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses).where(eq(businesses.isActive, true));
  }

  async getAllBusinessesForAdmin(): Promise<Business[]> {
    return await db.select().from(businesses);
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
      .values({
        ...insertBusiness,
        status: "pending",
        paymentStatus: "unpaid",
        isActive: false
      })
      .returning();
    return business;
  }

  async updateBusinessStatus(id: number, status: string, isActive?: boolean): Promise<Business | undefined> {
    const updateData: any = { status };
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    const [business] = await db
      .update(businesses)
      .set(updateData)
      .where(eq(businesses.id, id))
      .returning();
    return business || undefined;
  }

  async getAllAdvertisements(): Promise<Advertisement[]> {
    return await db.select().from(advertisements).where(eq(advertisements.isActive, true));
  }

  async getAllAdvertisementsForAdmin(): Promise<Advertisement[]> {
    return await db.select().from(advertisements);
  }

  async createAdvertisement(insertAd: InsertAdvertisement): Promise<Advertisement> {
    const [advertisement] = await db
      .insert(advertisements)
      .values({
        ...insertAd,
        status: "pending",
        paymentStatus: "unpaid",
        isActive: false
      })
      .returning();
    return advertisement;
  }

  async updateAdvertisementStatus(id: number, status: string, isActive?: boolean): Promise<Advertisement | undefined> {
    const updateData: any = { status };
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    const [advertisement] = await db
      .update(advertisements)
      .set(updateData)
      .where(eq(advertisements.id, id))
      .returning();
    return advertisement || undefined;
  }

  async getAdvertisementById(id: number): Promise<Advertisement | undefined> {
    const [advertisement] = await db.select().from(advertisements).where(eq(advertisements.id, id));
    return advertisement || undefined;
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

  async updateInquiryStatus(id: number, status: string): Promise<Inquiry | undefined> {
    const [inquiry] = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry || undefined;
  }
}

export const storage = new DatabaseStorage();