import Notification from '../models/notification.js';
import Student from '../models/student.js';
import { 
  sendEmailNotification, 
  sendQuizAssignmentEmail 
} from '../services/notificationEmail.service.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query; // 'all', 'unread'

    let query = { recipientId: userId };
    
    if (filter === 'unread') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

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
    console.log('🔔 Creating quiz notifications...');
    console.log('Quiz ID:', quizId);
    console.log('Quiz Data:', quizData);
    console.log('Teacher Name:', teacherName);

    // Get all students with their email and notification settings
    const students = await Student.find({}, { _id: 1, email: 1, name: 1, notificationSettings: 1 });
    console.log(`📧 Found ${students.length} students to notify`);

    if (students.length === 0) {
      console.log('⚠️ No students found in database');
      return { success: false, error: 'No students found' };
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

    console.log('📝 Sample notification:', notifications[0]);

    const result = await Notification.insertMany(notifications);
    console.log(`✅ Successfully created ${result.length} notifications`);

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

    return { success: true, count: result.length };
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
