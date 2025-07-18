import type { Franchise, Business, Advertisement } from "@shared/schema";

export const mockFranchises: Franchise[] = [
  {
    id: 1,
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
    createdAt: new Date(),
  },
  {
    id: 2,
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
    createdAt: new Date(),
  },
  // Additional franchises would be added here...
];

export const mockBusinesses: Business[] = [
  {
    id: 1,
    name: "Tech Solutions LLC",
    description: "Software development and IT consulting",
    category: "Computer Technology",
    country: "USA",
    state: "California",
    price: 250000,
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    contactEmail: "contact@techsolutions.com",
    isActive: true,
    createdAt: new Date(),
  },
  // Additional businesses would be added here...
];

export const mockAdvertisements: Advertisement[] = [
  {
    id: 1,
    title: "Business Meeting Solutions",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    targetUrl: "#",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 2,
    title: "Corporate Partnership Opportunities",
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    targetUrl: "#",
    isActive: true,
    createdAt: new Date(),
  },
  // Additional advertisements would be added here...
];
