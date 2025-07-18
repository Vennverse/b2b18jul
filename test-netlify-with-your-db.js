import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configure for serverless
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = 'postgresql://neondb_owner:npg_0CpHBlm2zqaF@ep-nameless-feather-a4dga2p7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({ 
  connectionString: DATABASE_URL,
  max: 1 
});

const db = drizzle(pool);

// Simulate Netlify function handler
async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Use raw SQL to match your exact schema
      const result = await pool.query('SELECT * FROM franchises WHERE is_active = true');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows),
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function testNetlifyFunction() {
  console.log('Testing Netlify function with your database...');
  
  const event = {
    httpMethod: 'GET',
    path: '/api/franchises',
    queryStringParameters: {},
    headers: {},
    body: null
  };
  
  const response = await handler(event);
  
  console.log('Response status:', response.statusCode);
  
  if (response.statusCode === 200) {
    const data = JSON.parse(response.body);
    console.log(`✅ SUCCESS: Found ${data.length} franchises`);
    console.log('Sample franchises:');
    data.slice(0, 3).forEach(f => {
      console.log(`- ${f.name} (${f.category}) - ${f.investment_range}`);
    });
  } else {
    console.log('❌ FAILED:', response.body);
  }
  
  await pool.end();
}

testNetlifyFunction();