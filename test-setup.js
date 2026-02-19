// Quick setup test script
const { Pool } = require('pg');
require('dotenv').config();

async function testSetup() {
  console.log('🔍 Testing Teacher Marketplace Setup...\n');

  // Test 1: Environment variables
  console.log('1. Checking environment variables...');
  const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '));
    console.log('💡 Copy .env.example to .env and configure it\n');
    return false;
  }
  console.log('✅ Environment variables configured\n');

  // Test 2: Database connection
  console.log('2. Testing database connection...');
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   Time: ${result.rows[0].now}\n`);

    // Test 3: Check if tables exist
    console.log('3. Checking database tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found. Run the schema:');
      console.log('   psql -d teacher_marketplace -f src/database/schema.sql\n');
    } else {
      console.log('✅ Found tables:', tablesResult.rows.map(r => r.table_name).join(', '));
      console.log(`   Total: ${tablesResult.rows.length} tables\n`);
    }

    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n💡 Make sure PostgreSQL is running and database exists:');
    console.log('   createdb teacher_marketplace');
    console.log('   psql -d teacher_marketplace -f src/database/schema.sql\n');
    return false;
  }
}

testSetup().then(success => {
  if (success) {
    console.log('✨ Setup looks good! Ready to start the application.\n');
    console.log('Start backend:  npm run dev');
    console.log('Start frontend: cd frontend && npm run dev\n');
  } else {
    console.log('❌ Setup incomplete. Please fix the issues above.\n');
  }
  process.exit(success ? 0 : 1);
});
