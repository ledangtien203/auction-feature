/**
 * Cleanup script for orphaned images
 * Run: node scripts/cleanupImages.js
 * 
 * Deletes images that are not referenced in any product or auction record
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '../../.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../packages/api/public/uploads');

async function cleanupOrphanedImages() {
  console.log('🧹 Starting image cleanup...\n');

  // Connect to database
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'auction_system',
  });

  try {
    // Get all used image URLs from products
    const [products] = await pool.execute(
      `SELECT DISTINCT image FROM product WHERE image IS NOT NULL AND image != ''`
    );

    // Get all used image URLs from categories
    const [categories] = await pool.execute(
      `SELECT DISTINCT image FROM product_category WHERE image IS NOT NULL AND image != ''`
    );

    // Get all used image URLs from settings (logos, banners)
    const [settings] = await pool.execute(
      `SELECT site_logo, banner_image FROM settings WHERE 1=1`
    );

    // Build set of used filenames
    const usedImages = new Set();
    
    for (const row of products) {
      if (row.image) {
        const filename = path.basename(row.image);
        usedImages.add(filename);
      }
    }
    
    for (const row of categories) {
      if (row.image) {
        const filename = path.basename(row.image);
        usedImages.add(filename);
      }
    }
    
    if (settings[0]) {
      if (settings[0].site_logo) {
        usedImages.add(path.basename(settings[0].site_logo));
      }
      if (settings[0].banner_image) {
        usedImages.add(path.basename(settings[0].banner_image));
      }
    }

    console.log(`📊 Found ${usedImages.size} images referenced in database\n`);

    // Get all files in upload directory
    if (!fs.existsSync(UPLOAD_DIR)) {
      console.log('📁 Upload directory does not exist');
      return;
    }

    const files = fs.readdirSync(UPLOAD_DIR);
    console.log(`📁 Found ${files.length} files in uploads folder\n`);

    // Find orphaned files
    const orphanedFiles = files.filter(file => !usedImages.has(file));
    
    if (orphanedFiles.length === 0) {
      console.log('✅ No orphaned images to delete');
      return;
    }

    console.log(`🗑️  Found ${orphanedFiles.length} orphaned images:\n`);
    
    let totalSize = 0;
    for (const file of orphanedFiles) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      console.log(`   - ${file} (${formatBytes(stats.size)})`);
    }
    
    console.log(`\n💾 Total size to free: ${formatBytes(totalSize)}\n`);

    // Ask for confirmation
    const args = process.argv.slice(2);
    if (args.includes('--dry-run')) {
      console.log('🔍 Dry run mode - no files will be deleted');
      return;
    }

    if (!args.includes('--force')) {
      console.log('⚠️  Run with --force to delete these files');
      console.log('   Example: node scripts/cleanupImages.js --force\n');
      return;
    }

    // Delete orphaned files
    console.log('🗑️  Deleting orphaned images...\n');
    for (const file of orphanedFiles) {
      const filePath = path.join(UPLOAD_DIR, file);
      fs.unlinkSync(filePath);
      console.log(`   ✅ Deleted: ${file}`);
    }

    console.log(`\n✨ Done! Deleted ${orphanedFiles.length} files, freed ${formatBytes(totalSize)}`);
    
    // Show remaining files
    const remainingFiles = fs.readdirSync(UPLOAD_DIR);
    console.log(`\n📁 Remaining files: ${remainingFiles.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

cleanupOrphanedImages();
