# EMEXA Notification System - Complete Implementation Guide

## Overview
The EMEXA notification system provides fully functional email and in-app notifications with user preference controls. Teachers and students can enable/disable notifications through their profile settings pages.

---

## Features

### 1. **Email Notifications**
- ✅ Sent when enabled in settings
- ✅ NOT sent when disabled in settings
- ✅ Automatic checks before sending any email
- ✅ Comprehensive email templates (Quiz Assignment, Quiz Grading, Settings Changes, etc.)

### 2. **In-App Notifications**
- ✅ Displayed when enabled in settings
- ✅ NOT displayed when disabled in settings
- ✅ Intelligent deduplication to prevent duplicate notifications
- ✅ Unread count respects user settings

### 3. **SMS Notifications** (Placeholder)
- Currently disabled by default
- Infrastructure ready for future implementation

---

## How It Works

### Database Structure

**User Notification Settings (in User Model)**
```javascript
notificationSettings: {
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  inAppNotifications: {
    type: Boolean,
    default: true
  }
}
```

**Notification Document (in MongoDB)**
```javascript
{
  recipientId: ObjectId,           // User receiving the notification
  recipientRole: 'student'|'teacher',
  type: 'quiz_assigned'|'quiz_graded'|'announcement'|'data_export'|'reminder',
  title: String,
  description: String,
  isRead: Boolean,
  createdAt: Timestamp,
  metadata: Object
}
```

---

## Frontend Implementation

### Student Profile Settings Page
**File:** `frontend/src/pages/StudentProfile.jsx`

**Notification Settings Section:**
```jsx
// State management
const [notificationSettings, setNotificationSettings] = useState({
  emailNotifications: true,
  smsNotifications: false,
  inAppNotifications: true
});

// Toggle handler
const handleNotificationToggle = (key) => {
  setNotificationSettings(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
};

// Save handler
const handleSaveNotifications = async () => {
  const response = await axios.put(
    'http://localhost:5000/api/users/notification-settings',
    notificationSettings,
    { headers: { Authorization: `Bearer ${token}` }}
  );
  // Settings saved successfully
};
```

### Teacher Profile Settings Page
**File:** `frontend/src/pages/TeacherProfile.jsx`

Same implementation as StudentProfile with additional admin override capability for system administrators.

---

## Backend Implementation

### 1. **Notification Controller** 
**File:** `backend/src/controllers/notificationController.js`

#### Key Functions:

**`getNotifications()`**
- ✅ Checks if `inAppNotifications` are enabled
- ✅ Returns empty array if disabled
- ✅ Applies intelligent deduplication
- ✅ Returns only unread if filter specified

```javascript
export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  
  // Check user's inApp notification preference
  let user = await User.findById(userId).select('notificationSettings');
  const inAppNotificationsEnabled = user?.notificationSettings?.inAppNotifications ?? true;
  
  // Return empty if disabled
  if (!inAppNotificationsEnabled) {
    return res.json({
      success: true,
      notifications: [],
      unreadCount: 0,
      message: 'In-app notifications are disabled'
    });
  }
  
  // Fetch and deduplicate notifications...
};
```

**`getUnreadCount()`**
- ✅ Checks `inAppNotifications` setting
- ✅ Returns 0 if in-app notifications disabled
- ✅ Applies deduplication logic
- ✅ Respects unread filter

**`getNotificationSettings()`** ⭐ NEW
- Returns current user's notification preferences
- Useful for frontend to know current state

**`testNotifications()`** ⭐ NEW
- Creates test in-app notification
- Sends test email
- Verifies all settings are working

---

### 2. **Email Notification Service**
**File:** `backend/src/services/notificationEmail.service.js`

#### Key Function:

**`sendEmailNotification(userId, userEmail, subject, htmlContent)`**
```javascript
export const sendEmailNotification = async (userId, userEmail, subject, htmlContent) => {
  try {
    // Fetch user to check settings
    let user = await User.findById(userId);
    
    // Check if email notifications enabled
    const emailNotificationsEnabled = user.notificationSettings?.emailNotifications ?? true;
    
    if (!emailNotificationsEnabled) {
      console.log('🔕 Email notifications disabled for user:', userId);
      return false; // Email NOT sent
    }
    
    // Send email only if enabled
    await transporter.sendMail({ ... });
    console.log('✅ Email notification sent');
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};
```

---

### 3. **User Controller**
**File:** `backend/src/controllers/userController.js`

#### Key Function:

**`updateNotificationSettings()`**
- Updates notification preferences in database
- Sends confirmation email (only if email notifications still enabled)
- Returns updated settings to frontend

```javascript
export const updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, inAppNotifications } = req.body;
    
    let user = await User.findById(req.userId);
    
    // Update settings
    user.notificationSettings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.notificationSettings?.emailNotifications ?? true,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : user.notificationSettings?.smsNotifications ?? false,
      inAppNotifications: inAppNotifications !== undefined ? inAppNotifications : user.notificationSettings?.inAppNotifications ?? true
    };
    
    await user.save();
    
    // Send confirmation email (if email notifications enabled)
    if (user.notificationSettings.emailNotifications) {
      await sendEmailNotification(req.userId, user.email, '⚙️ Settings Updated', emailHtml);
    }
    
    res.json({ 
      message: 'Notification settings updated successfully',
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

---

### 4. **Quiz Notification Creation**
**File:** `backend/src/controllers/notificationController.js`

#### Key Function:

**`createQuizNotification(quizId, quizData, teacherName)`**
- ✅ Creates in-app notification for ALL students
- ✅ Sends email ONLY to students with email notifications enabled
- ✅ Checks each student's settings individually

```javascript
export const createQuizNotification = async (quizId, quizData, teacherName) => {
  try {
    // Get all students with their notification settings
    const students = await Student.find({}, { _id: 1, email: 1, name: 1, notificationSettings: 1 });
    
    // Create in-app notifications for ALL students
    const notifications = students.map(student => ({
      recipientId: student._id,
      recipientRole: 'student',
      type: 'quiz_assigned',
      title: quizData.title,
      description: `New quiz assigned covering ${quizData.subject}...`,
      quizId: quizId,
      instructor: teacherName,
      status: 'pending'
    }));
    
    const result = await Notification.insertMany(notifications);
    
    // Send EMAIL ONLY to students with email notifications enabled
    for (const student of students) {
      const emailNotificationsEnabled = student.notificationSettings?.emailNotifications ?? true;
      
      if (emailNotificationsEnabled && student.email) {
        try {
          const emailHtml = await sendQuizAssignmentEmail(
            student.email,
            student.name,
            quizData.title,
            quizData.subject,
            teacherName
          );
          
          await sendEmailNotification(
            student._id,
            student.email,
            `📋 New Quiz Assigned: ${quizData.title}`,
            emailHtml
          );
        } catch (emailError) {
          console.error(`Failed to send email to ${student._id}:`, emailError.message);
        }
      }
    }
    
    return { success: true, count: result.length };
  } catch (error) {
    console.error('Error creating quiz notifications:', error);
    return { success: false, error: error.message };
  }
};
```

---

## API Endpoints

### 1. **Get Notifications** (Respects Settings)
```
GET /api/notifications
Headers: Authorization: Bearer {token}
Query: ?filter=unread (optional)

Response:
{
  success: true,
  notifications: [...],
  unreadCount: 5
}

⚠️ Returns empty array if inAppNotifications disabled
```

### 2. **Get Unread Count** (Respects Settings)
```
GET /api/notifications/unread-count
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  count: 5
}

⚠️ Returns 0 if inAppNotifications disabled
```

### 3. **Get Notification Settings** ⭐ NEW
```
GET /api/notifications/settings
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true
  }
}
```

### 4. **Update Notification Settings**
```
PUT /api/users/notification-settings
Headers: Authorization: Bearer {token}
Body: {
  emailNotifications: true/false,
  smsNotifications: true/false,
  inAppNotifications: true/false
}

Response:
{
  message: 'Notification settings updated successfully',
  notificationSettings: {...}
}

✅ Sends confirmation email (if email notifications enabled)
```

### 5. **Test Notifications** ⭐ NEW
```
POST /api/notifications/test
Headers: Authorization: Bearer {token}
Body: {
  type: 'email' | 'inapp' | 'both'
}

Response:
{
  success: true,
  tests: {
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
    inAppNotificationCreated: true,
    emailSent: true
  }
}

✅ Creates test notification in-app
✅ Sends test email
✅ Reports what was sent/not sent based on settings
```

### 6. **Mark Notification as Read**
```
PATCH /api/notifications/{notificationId}/read
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  notification: {...}
}
```

### 7. **Mark All Notifications as Read**
```
PATCH /api/notifications/mark-all-read
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  message: 'All notifications marked as read'
}
```

### 8. **Delete Notification**
```
DELETE /api/notifications/{notificationId}
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  message: 'Notification deleted'
}
```

---

## Testing the Notification System

### Manual Testing Checklist

**Test 1: Email Notifications Enabled**
1. Open StudentProfile settings
2. Ensure "Email Notifications" is toggled ON
3. Click "Save Changes"
4. Have a teacher assign a new quiz
5. ✅ Verify email received in inbox
6. ✅ Check that email contains quiz details

**Test 2: Email Notifications Disabled**
1. Open StudentProfile settings
2. Toggle "Email Notifications" OFF
3. Click "Save Changes"
4. Have a teacher assign a new quiz
5. ✅ Verify NO email received
6. ✅ Verify in-app notification still appears (if in-app enabled)

**Test 3: In-App Notifications Enabled**
1. Ensure "In-App Notifications" is toggled ON
2. Click "Save Changes"
3. Have a teacher assign a quiz
4. ✅ Open notification center
5. ✅ Verify notification appears in list

**Test 4: In-App Notifications Disabled**
1. Open StudentProfile settings
2. Toggle "In-App Notifications" OFF
3. Click "Save Changes"
4. Have a teacher assign a quiz
5. ✅ Open notification center
6. ✅ Verify no new notification appears
7. ✅ Verify notification bell shows 0 count

**Test 5: Both Enabled**
1. Enable both Email and In-App notifications
2. Assign a quiz
3. ✅ Verify BOTH email and in-app notification received

**Test 6: Test Endpoint**
1. Call POST /api/notifications/test with body `{ type: 'both' }`
2. ✅ Verify response shows both enabled
3. ✅ Check email inbox for test email
4. ✅ Check notifications center for test notification

---

## Notification Flow Diagrams

### Email Notification Flow
```
Quiz Assigned Event
    ↓
createQuizNotification() called
    ↓
For each student:
    ├─ Create in-app notification in DB
    └─ Check student.notificationSettings.emailNotifications
       ├─ If TRUE: Send email via sendEmailNotification()
       └─ If FALSE: Skip email, log as disabled
    ↓
✅ Done
```

### In-App Notification Flow
```
getNotifications() API called
    ↓
Check user.notificationSettings.inAppNotifications
    ├─ If FALSE: Return empty array, log as disabled
    └─ If TRUE: Proceed to fetch notifications
       ├─ Query notifications from DB
       ├─ Apply deduplication
       ├─ Filter by read status if requested
       └─ Return deduplicated notifications
    ↓
Frontend displays notifications
```

---

## Email Templates

### 1. Quiz Assignment Email
**Used when:** Teacher assigns a new quiz  
**Sent to:** Students with email notifications enabled  
**Contains:** Quiz title, subject, instructor name, deadline

### 2. Quiz Grading Email
**Used when:** Teacher grades a quiz  
**Sent to:** Students with email notifications enabled  
**Contains:** Quiz title, score, feedback link

### 3. Settings Change Email
**Used when:** User changes notification settings  
**Sent to:** User (only if email notifications still enabled)  
**Contains:** List of changed settings

### 4. Profile Update Email
**Used when:** User updates profile  
**Sent to:** User (only if email notifications enabled)  
**Contains:** Update timestamp, confirmation link

### 5. Test Email
**Used when:** User clicks "Test Notifications"  
**Sent to:** User (only if email notifications enabled)  
**Contains:** Confirmation that settings are working

---

## Logging & Debugging

### Console Logs to Watch

**Email Sending:**
```
✅ Email notification sent to: user@example.com
🔕 Email notifications disabled for user: [userId]
❌ Error sending email notification: [error message]
```

**In-App Notifications:**
```
🔕 In-app notifications disabled for user: [userId]
✅ Marked 5 duplicate notifications as read
🔔 Notification result: { count: 25 }
```

**Settings:**
```
💾 Saving notification settings: { emailNotifications: true, ... }
⚙️ Settings Updated - EMEXA
```

---

## Common Issues & Solutions

### Issue 1: Emails not sending but settings show enabled
**Debugging:**
1. Check `process.env.EMAIL_USER` and `process.env.EMAIL_PASSWORD` in `.env`
2. Verify Gmail account allows "Less secure app access"
3. Check server logs for `❌ Error sending email notification`
4. Try test endpoint: `POST /api/notifications/test`

### Issue 2: Notifications not appearing in app
**Debugging:**
1. Verify `notificationSettings.inAppNotifications` is `true`
2. Check if notifications are being created in DB
3. Verify notification bell component calls `getUnreadCount()`
4. Check for deduplication issues - see if old notifications are persisting

### Issue 3: Settings not persisting after save
**Debugging:**
1. Check if PUT request to `/api/users/notification-settings` returns 200
2. Verify token is valid and user is authenticated
3. Check if user document has `notificationSettings` field
4. Refresh page and re-fetch settings via `GET /api/notifications/settings`

### Issue 4: Admin can't change student notifications
**Debugging:**
1. Verify admin is using correct endpoint: `PUT /api/users/{userId}/notification-settings`
2. Check if target user ID is valid
3. Verify admin token is being sent
4. Check server logs for permission errors

---

## Best Practices

1. **Always check settings before sending notifications**
   - Every email send includes a check of `emailNotifications` setting
   - Every in-app notification retrieval checks `inAppNotifications` setting

2. **Provide clear feedback to users**
   - Toast/alert messages confirm settings were saved
   - Email confirmations sent when settings change
   - Test endpoint available to verify settings work

3. **Handle edge cases**
   - Default to enabled if settings not found
   - Skip email if user email is invalid
   - Continue with other users if one email fails

4. **Performance considerations**
   - Deduplicate notifications to reduce database size
   - Index notification queries for speed
   - Cache user settings when possible

5. **Security**
   - Verify user owns notification before marking as read
   - Use authentication middleware on all notification endpoints
   - Validate user ID matches authenticated user

---

## Future Enhancements

- [ ] SMS notification integration
- [ ] Push notifications (mobile app)
- [ ] Notification scheduling/time zones
- [ ] Notification categories/grouping
- [ ] Notification expiration/cleanup
- [ ] Real-time notifications via WebSocket
- [ ] Notification digest (daily/weekly summary)

---

## Support

For issues or questions about the notification system:
1. Check console logs for detailed error messages
2. Use test endpoint to verify settings
3. Check database directly for notification documents
4. Review this guide for configuration options

