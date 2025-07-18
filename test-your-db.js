import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { franchises, businesses } from './shared/schema.ts';
import ws from 'ws';

// Configure for serverless
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;

const DATABASE_URL = 'postgresql://neondb_owner:npg_0CpHBlm2zqaF@ep-nameless-feather-a4dga2p7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({ 
  connectionString: DATABASE_URL,
  max: 1 
});

const db = drizzle(pool);

async function testYourDatabase() {
  try {
    console.log('Testing your database connection...');
    
    const franchiseResults = await db.select().from(franchises);
    const businessResults = await db.select().from(businesses);
    
    console.log(`✅ Found ${franchiseResults.length} franchises`);
    console.log(`✅ Found ${businessResults.length} businesses`);
    
    console.log('\nSample franchises:');
    franchiseResults.slice(0, 3).forEach(f => {
      console.log(`- ${f.name} (${f.category}) - ${f.investmentRange}`);
    });
    
    console.log('\nSample businesses:');
    businessResults.slice(0, 3).forEach(b => {
      console.log(`- ${b.name} (${b.category}) - $${b.price}`);
    });
    
    await pool.end();
    console.log('\n🎉 Your database is working perfectly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    await pool.end();
  }
}

testYourDatabase();