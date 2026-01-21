// Test script to debug teacher dashboard stats
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Import models
import TeacherQuiz from './src/models/teacherQuiz.js';
import Notification from './src/models/notification.js';
import { QuizResult } from './src/models/quiz.js';
import User from './src/models/user.js';

async function testDashboardStats() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/emexa';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all teachers
    const teachers = await User.find({ role: 'teacher' }).lean();
    console.log('\n📋 Teachers in database:', teachers.length);
    
    // Check each teacher
    console.log('\n👥 Checking quiz distribution by teacher:');
    for (const teacher of teachers) {
      const teacherQuizzes = await TeacherQuiz.find({
        teacherId: teacher._id,
        isDeleted: false
      }).lean();
      
      console.log(`   ${teacher.name}: ${teacherQuizzes.length} quizzes`);
    }
    
    // Check total quizzes (including deleted)
    const totalQuizzes = await TeacherQuiz.countDocuments({});
    const deletedQuizzes = await TeacherQuiz.countDocuments({ isDeleted: true });
    console.log(`\n📊 Total quizzes in database: ${totalQuizzes}`);
    console.log(`   - Active: ${totalQuizzes - deletedQuizzes}`);
    console.log(`   - Deleted: ${deletedQuizzes}`);
    
    // Check what teacherIds are in the quizzes
    const sampleQuiz = await TeacherQuiz.findOne({ isDeleted: false }).lean();
    if (sampleQuiz) {
      console.log('\n🔍 Sample quiz data:');
      console.log('   Quiz ID:', sampleQuiz._id);
      console.log('   Teacher ID:', sampleQuiz.teacherId);
      console.log('   Teacher ID type:', typeof sampleQuiz.teacherId);
      console.log('   Title:', sampleQuiz.title);
      
      // Check if this teacherId exists in User collection
      const quizTeacher = await User.findById(sampleQuiz.teacherId).lean();
      if (quizTeacher) {
        console.log(`   ✅ Teacher found: ${quizTeacher.name} (${quizTeacher.role})`);
      } else {
        console.log(`   ❌ Teacher not found in User collection!`);
        
        // Check if teacherId is stored as string instead of ObjectId
        const quizTeacherString = await User.findOne({ _id: sampleQuiz.teacherId.toString() }).lean();
        if (quizTeacherString) {
          console.log(`   ✅ Found with string conversion: ${quizTeacherString.name}`);
        }
      }
    }
    
    // Get the teacher with most quizzes
    const teacherWithQuizzes = await TeacherQuiz.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$teacherId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    if (teacherWithQuizzes.length === 0) {
      console.log('\n❌ No active teacher quizzes found in the database!');
      console.log('   The teacher needs to create and share quizzes first.');
      await mongoose.connection.close();
      return;
    }
    
    const teacherId = teacherWithQuizzes[0]._id;
    const teacher = await User.findById(teacherId).lean();
    console.log('\n📋 Teachers in database:', teachers.length);
    
    if (teacher) {
      console.log('\n🧑‍🏫 Testing with teacher:');
      console.log('   ID:', teacher._id);
      console.log('   Name:', teacher.name);
      console.log('   Email:', teacher.email);

      // Check teacher quizzes
      const teacherQuizzes = await TeacherQuiz.find({
        teacherId: teacher._id,
        isDeleted: false
      }).lean();
      console.log('\n📚 Teacher quizzes:', teacherQuizzes.length);

      if (teacherQuizzes.length > 0) {
        console.log('   Sample quiz:');
        console.log('   - ID:', teacherQuizzes[0]._id);
        console.log('   - Title:', teacherQuizzes[0].title);
        console.log('   - Status:', teacherQuizzes[0].status);
      }

      // Check notifications
      const quizIds = teacherQuizzes.map(q => q._id);
      const notifications = await Notification.find({
        quizId: { $in: quizIds },
        type: 'quiz_assigned',
        recipientRole: 'student'
      }).lean();
      console.log('\n📬 Quiz notifications:', notifications.length);

      if (notifications.length > 0) {
        console.log('   Sample notification:');
        console.log('   - Recipient ID:', notifications[0].recipientId);
        console.log('   - Quiz ID:', notifications[0].quizId);
        console.log('   - Title:', notifications[0].title);
      }

      // Check unique students
      const studentIds = [...new Set(notifications.map(n => n.recipientId))];
      console.log('\n👥 Unique students assigned quizzes:', studentIds.length);

      // Check quiz results
      const quizResults = await QuizResult.find({
        quizId: { $in: quizIds.map(id => id.toString()) }
      }).lean();
      console.log('\n📝 Quiz results in database:', quizResults.length);

      if (quizResults.length > 0) {
        console.log('   Sample result:');
        console.log('   - User ID:', quizResults[0].userId);
        console.log('   - Quiz ID:', quizResults[0].quizId);
        console.log('   - Score:', quizResults[0].score);
        console.log('   - Submitted:', quizResults[0].submittedAt);
      }

      // Check if quiz IDs match
      console.log('\n🔍 Checking quiz ID formats:');
      console.log('   TeacherQuiz ID type:', typeof quizIds[0], '| Value:', quizIds[0]?.toString());
      if (quizResults.length > 0) {
        console.log('   QuizResult quizId type:', typeof quizResults[0].quizId, '| Value:', quizResults[0].quizId);
      }

      // Try to find quiz results with ObjectId
      const quizResultsWithObjectId = await QuizResult.find({
        quizId: { $in: quizIds }
      }).lean();
      console.log('\n🔍 Quiz results when searching with ObjectId:', quizResultsWithObjectId.length);

    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDashboardStats();
