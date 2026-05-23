import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from packages/ folder
const workspaceRoot = path.resolve(process.cwd(), '../../');
dotenv.config({ path: path.join(workspaceRoot, 'packages/.env') });

const schemaPath = path.join(workspaceRoot, 'packages/database/schema.sql');

const config = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
};

async function seed() {
  console.log('🔄 Connecting to MySQL...');
  console.log('📁 Schema path:', schemaPath);
  
  // Verify schema file exists
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found at:', schemaPath);
    return;
  }
  
  // Create connection without database first
  const connection = await mysql.createConnection({
    ...config,
    database: undefined,
    multipleStatements: true,
  });

  try {
    // Drop and recreate database
    console.log('🗑️  Dropping existing database...');
    await connection.query('DROP DATABASE IF EXISTS auction_system');
    
    console.log('📦 Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS auction_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    // Read schema file
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📥 Importing schema and seed data...');
    
    // Execute schema
    await connection.query('USE auction_system');
    await connection.query(schemaSql);
    
    console.log('');
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - Database: auction_system');
    console.log('   - Tables created: role, user, product_category, product, auction_status, auction_time,');
    console.log('                    auction, auction_history, transaction_history, notification, comment,');
    console.log('                    action_logs, settings');
    console.log('');
    console.log('🔑 Test Accounts:');
    console.log('   Admin: admin@daugia.com / admin123');
    console.log('   Users: nguyenvana@mail.com, tranb@mail.com, etc. / 123456');
    console.log('');
    console.log('🚀 Start the servers:');
    console.log('   pnpm dev');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
  }
}

seed();
