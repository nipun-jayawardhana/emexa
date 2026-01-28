/**
 * Script to remove duplicate quiz assignment notifications
 * Run this once to clean up existing duplicates in the database
 * 
 * Usage: node scripts/removeDuplicateNotifications.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Notification Schema (minimal version for this script)
const notificationSchema = new mongoose.Schema({
  recipientId: mongoose.Schema.Types.ObjectId,
  recipientRole: String,
  type: String,
  title: String,
  description: String,
  quizId: mongoose.Schema.Types.ObjectId,
  instructor: String,
  dueDate: String,
  score: String,
  status: String,
  isRead: Boolean,
  metadata: Object
}, { 
  timestamps: true 
});

const Notification = mongoose.model('Notification', notificationSchema);

async function removeDuplicateNotifications() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/emexa';
    console.log(`📍 Using database URI: ${uri.replace(/\/\/.*@/, '//***@')}`); // Hide credentials in log
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Finding duplicate quiz assignment notifications...');

    // Find all quiz_assigned notifications
    const notifications = await Notification.find({ 
      type: 'quiz_assigned',
      quizId: { $exists: true }
    }).sort({ createdAt: 1 }); // Sort by oldest first

    console.log(`📊 Found ${notifications.length} quiz assignment notifications`);

    // Group by recipientId + quizId
    const groupedNotifications = new Map();
    
    notifications.forEach(notif => {
      const key = `${notif.recipientId}_${notif.quizId}`;
      if (!groupedNotifications.has(key)) {
        groupedNotifications.set(key, []);
      }
      groupedNotifications.get(key).push(notif);
    });

    // Find duplicates
    let totalDuplicates = 0;
    const duplicatesToRemove = [];

    groupedNotifications.forEach((notifs, key) => {
      if (notifs.length > 1) {
        // Keep the first (oldest) notification, mark others for deletion
        const [keep, ...remove] = notifs;
        totalDuplicates += remove.length;
        duplicatesToRemove.push(...remove.map(n => n._id));
        
        console.log(`🔄 Found ${notifs.length} duplicates for key: ${key}`);
        console.log(`   ✅ Keeping: ${keep._id} (${keep.createdAt})`);
        console.log(`   ❌ Removing: ${remove.length} duplicate(s)`);
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total notifications: ${notifications.length}`);
    console.log(`   Unique combinations: ${groupedNotifications.size}`);
    console.log(`   Duplicates to remove: ${totalDuplicates}`);

    if (duplicatesToRemove.length > 0) {
      console.log(`\n🗑️  Removing ${duplicatesToRemove.length} duplicate notifications...`);
      
      const deleteResult = await Notification.deleteMany({
        _id: { $in: duplicatesToRemove }
      });

      console.log(`✅ Successfully removed ${deleteResult.deletedCount} duplicate notifications`);
    } else {
      console.log(`\n✅ No duplicates found - database is clean!`);
    }

    // Create the unique index
    console.log('\n🔧 Creating unique compound index...');
    try {
      await Notification.collection.createIndex(
        { recipientId: 1, quizId: 1, type: 1 },
        { 
          unique: true, 
          partialFilterExpression: { 
            type: 'quiz_assigned',
            quizId: { $exists: true } 
          },
          name: 'unique_quiz_assignment'
        }
      );
      console.log('✅ Unique index created successfully');
    } catch (indexError) {
      if (indexError.code === 85) {
        console.log('ℹ️  Index already exists, skipping creation');
      } else {
        console.error('❌ Error creating index:', indexError.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('🎉 Your notification system is now protected against duplicates.');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
removeDuplicateNotifications();
