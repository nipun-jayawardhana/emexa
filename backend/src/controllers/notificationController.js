import Notification from '../models/notification.js';
import Student from '../models/student.js';
import { 
  sendEmailNotification, 
  sendQuizAssignmentEmail 
} from '../services/notificationEmail.service.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role; // Get user role from token
    const { filter } = req.query; // 'all', 'unread'

    console.log('🔍 Fetching notifications for user:', userId, 'Role:', userRole);

    // Build query - if role is available, use it for more specific matching
    let query = { recipientId: userId };
    
    // Only add recipientRole filter if it exists
    if (userRole) {
      query.recipientRole = userRole;
    }
    
    if (filter === 'unread') {
      query.isRead = false;
    }

    console.log('📋 Query:', JSON.stringify(query));

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`✅ Found ${notifications.length} notifications for user`);
    if (notifications.length > 0) {
      console.log('📄 Sample notification:', {
        id: notifications[0]._id,
        type: notifications[0].type,
        recipientRole: notifications[0].recipientRole,
        title: notifications[0].title
      });
    }

    // Build unreadCount query similarly
    const unreadQuery = { 
      recipientId: userId,
      isRead: false 
    };
    if (userRole) {
      unreadQuery.recipientRole = userRole;
    }

    const unreadCount = await Notification.countDocuments(unreadQuery);

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications' 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read' 
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all notifications as read' 
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete notification' 
    });
  }
};

// Create notification when quiz is shared (called from quiz controller)
export const createQuizNotification = async (quizId, quizData, teacherName) => {
  try {
    console.log('='.repeat(80));
    console.log('🔔 CREATING QUIZ NOTIFICATIONS');
    console.log('='.repeat(80));
    console.log('Quiz ID:', quizId);
    console.log('Quiz Data:', JSON.stringify(quizData, null, 2));
    console.log('Teacher Name:', teacherName);

    // Check if notifications already exist for this quiz (prevents race conditions)
    const existingCount = await Notification.countDocuments({ 
      quizId: quizId, 
      type: 'quiz_assigned' 
    });

    if (existingCount > 0) {
      console.log(`⚠️ Notifications already exist for this quiz (${existingCount} found). Skipping duplicate creation.`);
      return { success: true, count: 0, message: 'Notifications already exist', skipped: true };
    }

    // Parse grade levels from quizData (e.g., ["1-1", "1-2"] or ["1st year 1st semester"])
    let targetGradeLevels = [];
    
    if (quizData.gradeLevel && Array.isArray(quizData.gradeLevel)) {
      targetGradeLevels = quizData.gradeLevel.map(grade => {
        // Handle format "1-1" -> { year: "1st year", semester: "1st semester" }
        if (grade.includes('-')) {
          const [yearNum, semNum] = grade.split('-');
          const yearSuffix = yearNum === '1' ? 'st' : yearNum === '2' ? 'nd' : yearNum === '3' ? 'rd' : 'th';
          const semSuffix = semNum === '1' ? 'st' : semNum === '2' ? 'nd' : 'rd';
          return {
            year: `${yearNum}${yearSuffix} year`,
            semester: `${semNum}${semSuffix} semester`
          };
        }
        // Handle format "1st Year 1st Sem" or similar
        if (grade.toLowerCase().includes('year')) {
          const parts = grade.split(' ');
          const year = parts.find(p => p.toLowerCase().includes('year'));
          const sem = parts.find(p => p.toLowerCase().includes('sem'));
          return {
            year: year ? `${year.replace(/year/i, '').trim()} year` : null,
            semester: sem ? `${sem.replace(/sem/i, '').trim()} semester` : null
          };
        }
        return null;
      }).filter(Boolean);
    }
    
    console.log('🎯 Target grade levels:', JSON.stringify(targetGradeLevels, null, 2));

    // Build query to filter students by grade level
    let studentQuery = { approvalStatus: 'approved' }; // Only send to approved students
    
    if (targetGradeLevels.length > 0) {
      // Create OR conditions for each grade level
      const gradeConditions = targetGradeLevels.map(grade => ({
        year: grade.year,
        semester: grade.semester
      }));
      
      studentQuery.$or = gradeConditions;
      console.log('🔍 Student filter query:', JSON.stringify(studentQuery, null, 2));
    }

    // Get students matching the grade level filter
    const students = await Student.find(studentQuery, { 
      _id: 1, 
      email: 1, 
      name: 1, 
      year: 1, 
      semester: 1,
      approvalStatus: 1,
      notificationSettings: 1 
    });
    
    console.log(`📚 Found ${students.length} students matching grade level criteria`);
    console.log('📋 All matched students:', students.map(s => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email,
      year: s.year,
      semester: s.semester,
      approvalStatus: s.approvalStatus
    })));

    if (students.length === 0) {
      console.log('⚠️ No students found matching the grade level criteria');
      return { success: true, count: 0, message: 'No students match the target grade level' };
    }

    // Create notifications for all students
    const notifications = students.map(student => ({
      recipientId: student._id,
      recipientRole: 'student',
      type: 'quiz_assigned',
      title: quizData.title,
      description: `New quiz assigned covering ${quizData.subject}. Please complete before the deadline.`,
      quizId: quizId,
      instructor: teacherName,
      dueDate: quizData.dueDate || 'No deadline set',
      status: 'pending'
    }));

    console.log('📝 Creating notifications for students:', notifications.length);
    console.log('📝 Sample notification data:', JSON.stringify(notifications[0], null, 2));

    // Use ordered:false to continue inserting even if some duplicates are encountered
    // This handles race conditions where multiple requests try to create notifications simultaneously
    const result = await Notification.insertMany(notifications, { ordered: false })
      .catch(error => {
        // If error is due to duplicate key (E11000), extract successful inserts
        if (error.code === 11000 && error.writeErrors) {
          console.log(`⚠️ Some duplicate notifications detected during insert, ${error.insertedDocs?.length || 0} new notifications created`);
          return error.insertedDocs || [];
        }
        throw error; // Re-throw if it's a different error
      });
    
    const insertedCount = Array.isArray(result) ? result.length : 0;
    console.log(`✅ Successfully created ${insertedCount} notifications in database`);
    console.log('='.repeat(80));

    // Send email notifications to students who have email notifications enabled
    console.log('📧 Sending email notifications...');
    for (const student of students) {
      const emailNotificationsEnabled = student.notificationSettings?.emailNotifications ?? true;
      
      if (emailNotificationsEnabled && student.email) {
        try {
          const emailHtml = await sendQuizAssignmentEmail(
            student.email,
            student.name || 'Student',
            quizData.title,
            quizData.subject || 'General',
            teacherName
          );
          
          await sendEmailNotification(
            student._id,
            student.email,
            `📋 New Quiz Assigned: ${quizData.title}`,
            emailHtml
          );
        } catch (emailError) {
          console.error(`❌ Failed to send email to student ${student._id}:`, emailError.message);
          // Continue with other students even if one email fails
        }
      }
    }

    return { success: true, count: insertedCount };
  } catch (error) {
    console.error('❌ Error creating quiz notifications:', error);
    return { success: false, error: error.message };
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get unread count' 
    });
  }
};

// Create data export notification for teacher
export const createDataExportNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { fileName } = req.body;

    // Only teachers can export data
    if (userRole !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can export data'
      });
    }

    const notification = await Notification.create({
      recipientId: userId,
      recipientRole: 'teacher',
      type: 'data_export',
      title: 'Data Export Complete',
      description: `Your personal data has been successfully exported as ${fileName}`,
      status: 'completed',
      isRead: false,
      metadata: {
        fileName,
        exportDate: new Date().toISOString()
      }
    });

    console.log('✅ Data export notification created:', notification._id);

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('❌ Error creating data export notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
};
