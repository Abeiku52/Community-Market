const { Client } = require('pg');
const fs = require('fs');

async function initDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read and execute schema
    const schema = fs.readFileSync('./src/database/schema.sql', 'utf8');
    await client.query(schema);
    console.log('Schema created successfully');

    // Read and execute migrations
    const migrations = fs.readFileSync('./src/database/add-new-features.sql', 'utf8');
    await client.query(migrations);
    console.log('Migrations applied successfully');

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
