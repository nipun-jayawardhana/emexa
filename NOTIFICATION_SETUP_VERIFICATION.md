# Notification System Verification Checklist

## ✅ Backend Setup

### Models
- [x] **User Model** (`backend/src/models/user.js`)
  - [x] Has `notificationSettings` object with:
    - `emailNotifications` (Boolean, default: true)
    - `smsNotifications` (Boolean, default: false)
    - `inAppNotifications` (Boolean, default: true)

- [x] **Notification Model** (`backend/src/models/notification.js`)
  - [x] Has `recipientId` field
  - [x] Has `recipientRole` field (student/teacher)
  - [x] Has `type` field (quiz_assigned, quiz_graded, etc.)
  - [x] Has `isRead` boolean field
  - [x] Has timestamps

### Controllers
- [x] **Notification Controller** (`backend/src/controllers/notificationController.js`)
  - [x] `getNotifications()` - Checks `inAppNotifications` setting before returning
  - [x] `getUnreadCount()` - Checks `inAppNotifications` setting before counting
  - [x] `createQuizNotification()` - Sends emails only to students with `emailNotifications` enabled
  - [x] `getNotificationSettings()` - NEW endpoint to get user's notification preferences
  - [x] `testNotifications()` - NEW endpoint to test email and in-app notifications
  - [x] Imports: User, Student, Teacher models

- [x] **User Controller** (`backend/src/controllers/userController.js`)
  - [x] `updateNotificationSettings()` - Updates settings and sends confirmation email (if email enabled)

### Services
- [x] **Notification Email Service** (`backend/src/services/notificationEmail.service.js`)
  - [x] `sendEmailNotification()` - Checks `emailNotifications` before sending
  - [x] `sendQuizAssignmentEmail()` - Email template for quiz assignments
  - [x] `sendProfileUpdateEmail()` - Email template for profile updates
  - [x] `sendSettingsChangeEmail()` - Email template for settings changes

### Routes
- [x] **Notification Routes** (`backend/src/routes/notificationRoutes.js`)
  - [x] `GET /notifications` - Get all notifications
  - [x] `GET /notifications/unread-count` - Get unread count
  - [x] `GET /notifications/settings` - Get notification settings (NEW)
  - [x] `POST /notifications/test` - Test notifications (NEW)
  - [x] `PATCH /notifications/:notificationId/read` - Mark as read
  - [x] `PATCH /notifications/mark-all-read` - Mark all as read
  - [x] `DELETE /notifications/:notificationId` - Delete notification

- [x] **User Routes** (`backend/src/routes/userRoutes.js`)
  - [x] `PUT /users/notification-settings` - Update notification settings

---

## ✅ Frontend Setup

### Student Profile Page
- [x] **File:** `frontend/src/pages/StudentProfile.jsx`
  - [x] State: `notificationSettings` with emailNotifications, smsNotifications, inAppNotifications
  - [x] Handler: `handleNotificationToggle()` to toggle settings
  - [x] Handler: `handleSaveNotifications()` to save to backend
  - [x] UI: Three toggle switches for each notification type
  - [x] Loads settings from user data on page load
  - [x] Sends PUT request to `/api/users/notification-settings`

### Teacher Profile Page
- [x] **File:** `frontend/src/pages/TeacherProfile.jsx`
  - [x] Same functionality as StudentProfile
  - [x] Admin can override settings for other teachers
  - [x] Sends PUT request to `/api/users/notification-settings` or `/api/users/{userId}/notification-settings` (admin)

---

## ✅ Notification Flow

### Email Notification Flow
```
✅ When teacher assigns quiz:
  1. createQuizNotification() is called
  2. For each student:
     - Create in-app notification in DB (ALWAYS)
     - Check student.notificationSettings.emailNotifications
     - If TRUE: Send email
     - If FALSE: Skip email (log as disabled)
  3. Result: All students get in-app, only enabled get email

✅ When user changes notification settings:
  1. updateNotificationSettings() is called
  2. Update user.notificationSettings in DB
  3. Check if user.notificationSettings.emailNotifications is TRUE
  4. If TRUE: Send confirmation email
  5. If FALSE: Skip email (user chose to disable emails)
```

### In-App Notification Flow
```
✅ When user opens notification center:
  1. getNotifications() is called
  2. Check user.notificationSettings.inAppNotifications
  3. If FALSE: Return empty array (log as disabled)
  4. If TRUE: Fetch, deduplicate, and return notifications
  5. Frontend displays notifications

✅ When getting unread count:
  1. getUnreadCount() is called
  2. Check user.notificationSettings.inAppNotifications
  3. If FALSE: Return 0 (log as disabled)
  4. If TRUE: Count unread and return
  5. Frontend shows count on notification bell
```

---

## ✅ Testing Checklist

### Test 1: Email with Notifications Enabled ✅
- [ ] Go to StudentProfile → Settings
- [ ] Ensure "Email Notifications" is ON
- [ ] Save changes
- [ ] Have teacher assign quiz
- [ ] Check email inbox
- [ ] Should receive email with quiz details
- [ ] Check console: Should see "✅ Email notification sent to:"

### Test 2: Email with Notifications Disabled ✅
- [ ] Go to StudentProfile → Settings
- [ ] Toggle "Email Notifications" OFF
- [ ] Save changes
- [ ] Have teacher assign quiz
- [ ] Check email inbox
- [ ] Should NOT receive email
- [ ] Check console: Should see "🔕 Email notifications disabled for user:"

### Test 3: In-App with Notifications Enabled ✅
- [ ] Go to StudentProfile → Settings
- [ ] Ensure "In-App Notifications" is ON
- [ ] Save changes
- [ ] Have teacher assign quiz
- [ ] Click notification bell
- [ ] Should see new quiz notification in list

### Test 4: In-App with Notifications Disabled ✅
- [ ] Go to StudentProfile → Settings
- [ ] Toggle "In-App Notifications" OFF
- [ ] Save changes
- [ ] Have teacher assign quiz
- [ ] Click notification bell
- [ ] Should NOT see new notification
- [ ] Notification bell should show 0 unread

### Test 5: Settings Change Confirmation ✅
- [ ] Go to StudentProfile → Settings
- [ ] Toggle any setting
- [ ] Save changes
- [ ] Check email (if email notifications enabled)
- [ ] Should receive "⚙️ Settings Updated" email with list of changes
- [ ] If email was disabled, should NOT receive email

### Test 6: Both Disabled ✅
- [ ] Go to StudentProfile → Settings
- [ ] Disable both Email and In-App notifications
- [ ] Save changes
- [ ] Have teacher assign quiz
- [ ] Should NOT receive email
- [ ] Should NOT see notification in app
- [ ] Notification bell should show 0

### Test 7: Test Endpoint ✅
- [ ] Call POST /api/notifications/test with `{ type: 'both' }`
- [ ] Should return success: true
- [ ] Should indicate which notifications are enabled
- [ ] Check email for test email
- [ ] Check notifications center for test notification
- [ ] Response should show if each was sent/created

### Test 8: Admin Override (if applicable) ✅
- [ ] Login as admin
- [ ] Go to student's profile
- [ ] Toggle notification settings
- [ ] Click "Save by Admin"
- [ ] Verify settings changed in student's profile
- [ ] Verify confirmation email sent to student (if email enabled)

---

## ✅ Database Checks

### Check User Document
```javascript
// Should have this structure:
{
  _id: ObjectId,
  name: String,
  email: String,
  notificationSettings: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    inAppNotifications: Boolean
  },
  // ... other fields
}
```

### Check Notification Documents
```javascript
// Should have these fields:
{
  _id: ObjectId,
  recipientId: ObjectId,
  recipientRole: 'student' | 'teacher',
  type: 'quiz_assigned' | 'quiz_graded' | 'announcement',
  title: String,
  description: String,
  isRead: Boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## ✅ Environment Variables

Make sure `.env` file has:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
NODE_ENV=development
```

Note: For Gmail, use App Password (not your regular password) if 2FA is enabled.

---

## ✅ Common Issues & Fixes

### Issue: Emails not sending
**Check:**
1. [ ] EMAIL_USER and EMAIL_PASSWORD in .env
2. [ ] Gmail account allows "Less secure apps"
3. [ ] User has emailNotifications: true
4. [ ] Server logs show "✅ Email notification sent to:"

### Issue: In-app notifications not showing
**Check:**
1. [ ] inAppNotifications is true in settings
2. [ ] Notifications exist in database
3. [ ] Frontend calls GET /api/notifications
4. [ ] Response has notifications array

### Issue: Settings not saving
**Check:**
1. [ ] PUT /api/users/notification-settings returns 200
2. [ ] User is authenticated (token valid)
3. [ ] User document has notificationSettings field
4. [ ] No validation errors in server logs

### Issue: Unread count not updating
**Check:**
1. [ ] inAppNotifications is enabled
2. [ ] GET /api/notifications/unread-count returns count > 0
3. [ ] Notifications have isRead: false
4. [ ] Frontend refreshes count after marking as read

---

## 📋 Deployment Checklist

- [ ] All models have notificationSettings field
- [ ] All controllers handle settings checks
- [ ] Email service has proper error handling
- [ ] Routes are registered in main app
- [ ] Environment variables are set
- [ ] Database migrations completed (if needed)
- [ ] Frontend loads settings on page load
- [ ] Test notifications work end-to-end
- [ ] Admin can override settings
- [ ] Notifications are deduplicated
- [ ] Old notifications cleaned up periodically

---

## 📞 Support

If something isn't working:
1. Check console logs for error messages
2. Use test endpoint: `POST /api/notifications/test`
3. Verify database has notificationSettings
4. Check that routes are registered
5. Ensure environment variables are set
6. Run test-notification-system.js for comprehensive test

