import { db } from './server/db.js';
import { users, franchises, businesses, advertisements } from './shared/schema.js';
import bcrypt from 'bcryptjs';

console.log('Seeding database...');

async function seed() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
    }).onConflictDoNothing();

    // Insert sample franchises  
    await db.insert(franchises).values([
      {
        name: 'MILKSTER',
        description: 'Premium ice cream and dessert franchise with proven business model',
        category: 'Food',
        country: 'USA',
        state: 'California',
        investmentRange: '$40k-$150k',
        imageUrl: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?ixlib=rb-4.0.3',
        contactEmail: 'franchise@milkster.com',
        investmentMin: 40000,
        investmentMax: 150000,
        isActive: true
      },
      {
        name: 'TechFlow Solutions',
        description: 'Digital transformation and IT consulting franchise',
        category: 'Technology',
        country: 'USA',
        state: 'New York',
        investmentRange: '$75k-$200k',
        imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3',
        contactEmail: 'franchise@techflow.com',
        investmentMin: 75000,
        investmentMax: 200000,
        isActive: true
      }
    ]).onConflictDoNothing();

    // Insert sample businesses
    await db.insert(businesses).values([
      {
        name: 'Downtown Coffee House',
        description: 'Established coffee shop in prime downtown location',
        category: 'Food & Beverage', 
        country: 'USA',
        state: 'California',
        price: 125000,
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3',
        contactEmail: 'owner@coffeehouse.com',
        package: 'Basic',
        yearEstablished: '2018',
        employees: '8',
        revenue: '$180,000',
        reason: 'Retirement',
        assets: 'Equipment, furniture, inventory',
        status: 'active',
        paymentStatus: 'paid',
        isActive: true
      },
      {
        name: 'Tech Startup',
        description: 'Growing software development company',
        category: 'Technology',
        country: 'USA',
        state: 'Texas',
        price: 350000,
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3',
        contactEmail: 'founder@techstartup.com',
        package: 'Premium',
        yearEstablished: '2020',
        employees: '15',
        revenue: '$520,000',
        reason: 'New venture',
        assets: 'IP, contracts, equipment',
        status: 'active',
        paymentStatus: 'paid',
        isActive: true
      }
    ]).onConflictDoNothing();

    // Insert sample advertisements  
    await db.insert(advertisements).values([
      {
        title: 'Digital Marketing Agency',
        description: 'Professional digital marketing services for small businesses',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3',
        targetUrl: 'https://digitalmarketing.example.com',
        package: 'Premium',
        company: 'Digital Pro Agency',
        contactEmail: 'info@digitalpro.com',
        contactPhone: '555-0123',
        budget: '$5000',
        status: 'active',
        paymentStatus: 'paid',
        isActive: true
      },
      {
        title: 'Professional Accounting Services',
        description: 'Expert accounting and tax services for businesses',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3',
        targetUrl: 'https://accounting.example.com',
        package: 'Basic',
        company: 'ProAccounting LLC',
        contactEmail: 'info@proaccounting.com',
        contactPhone: '555-0456',
        budget: '$2500',
        status: 'active',
        paymentStatus: 'paid',
        isActive: true
      }
    ]).onConflictDoNothing();

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seed();
