// Test script to verify Netlify functions work correctly
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testNetlifyFunctions() {
  console.log('🔧 Testing Netlify Functions Build...');
  
  // Test if functions are built correctly
  const functionsDir = './netlify/functions/';
  const jsFiles = ['franchises.js', 'businesses.js', 'advertisements.js', 'auth.js'];
  
  let allBuilt = true;
  jsFiles.forEach(file => {
    try {
      const content = readFileSync(functionsDir + file, 'utf8');
      if (content.includes('exports.handler')) {
        console.log(`✅ ${file} - Built correctly`);
      } else {
        console.log(`❌ ${file} - Missing handler export`);
        allBuilt = false;
      }
    } catch (error) {
      console.log(`❌ ${file} - Not found`);
      allBuilt = false;
    }
  });
  
  // Test build process
  console.log('\n🏗️ Testing build commands...');
  try {
    const { stdout, stderr } = await execAsync('npm run build');
    console.log('✅ Build command successful');
    
    const functionsResult = await execAsync('node build-functions.js');
    console.log('✅ Functions build successful');
    
    // Check dist directory
    const distFiles = ['dist/public/index.html', 'dist/public/assets'];
    distFiles.forEach(file => {
      try {
        const stats = readFileSync(file.includes('assets') ? 'dist/public/assets/index-BCI2Z4q0.js' : file, 'utf8');
        console.log(`✅ ${file} - Generated correctly`);
      } catch (error) {
        console.log(`❌ ${file} - Missing`);
      }
    });
    
  } catch (error) {
    console.log('❌ Build process failed:', error.message);
    allBuilt = false;
  }
  
  return allBuilt;
}

async function testDatabaseConnection() {
  console.log('\n🗄️ Testing Database Connection...');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not set');
    return false;
  }
  
  try {
    // Import and test database connection
    const { pool } = await import('./server/db.js');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Test sample data
    const franchiseResult = await pool.query('SELECT COUNT(*) FROM franchises');
    const businessResult = await pool.query('SELECT COUNT(*) FROM businesses');
    
    console.log(`✅ Franchises in database: ${franchiseResult.rows[0].count}`);
    console.log(`✅ Businesses in database: ${businessResult.rows[0].count}`);
    
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Netlify Deployment Test...\n');
  
  const functionsOk = await testNetlifyFunctions();
  const databaseOk = await testDatabaseConnection();
  
  console.log('\n📊 Test Results:');
  console.log(`Functions Build: ${functionsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Connection: ${databaseOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (functionsOk && databaseOk) {
    console.log('\n🎉 All tests passed! Your app is ready for Netlify deployment.');
    console.log('\n📋 Netlify Deployment Checklist:');
    console.log('1. Set DATABASE_URL environment variable in Netlify');
    console.log('2. Deploy the dist/public folder as static site');
    console.log('3. Netlify functions will be automatically deployed');
    console.log('4. Ensure your database has sample data populated');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
  }
}

main().catch(console.error);