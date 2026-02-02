# 🚀 Notification System - Quick Start Guide

## For End Users (Students & Teachers)

### Enable/Disable Notifications

1. **Open Your Profile**
   - Click on your profile picture/name in header
   - Select "Profile" or go to your profile page

2. **Go to Settings**
   - Click the "Settings" tab
   - Scroll to "Notification Preferences"

3. **Toggle Notifications**
   - 📧 **Email Notifications**: Receive emails for quiz assignments, grades, etc.
   - 🔔 **In-App Notifications**: See notifications in the app notification center
   - 📱 **SMS Notifications**: (Coming soon)

4. **Save Changes**
   - Click "Save Changes" button
   - ✅ You'll get a confirmation message
   - 📧 Confirmation email sent (if email notifications enabled)

---

## For Developers

### Quick API Test

**Test all notifications:**
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"both"}'
```

**Get current settings:**
```bash
curl http://localhost:5000/api/notifications/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update settings:**
```bash
curl -X PUT http://localhost:5000/api/users/notification-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": true,
    "inAppNotifications": true,
    "smsNotifications": false
  }'
```

---

## What Happens When You Save Settings

### If Email Notifications Change:
```
You toggle Email Notifications OFF
    ↓
✅ Saved to database
    ↓
📧 Confirmation email sent (because they were ON)
    ↓
✅ From now on:
   - No more emails for quiz assignments
   - No more emails for grades
   - No more emails for anything
   - In-app notifications still work (if enabled)
```

### If In-App Notifications Change:
```
You toggle In-App Notifications OFF
    ↓
✅ Saved to database
    ↓
✅ From now on:
   - Notification bell shows 0
   - Notification center shows nothing
   - But emails still come (if enabled)
```

---

## Testing Checklist

### Test 1: Both Enabled
- [ ] Go to Settings
- [ ] Ensure Email Notifications = ON
- [ ] Ensure In-App Notifications = ON
- [ ] Save Changes
- [ ] Have teacher assign a quiz
- [ ] ✅ You receive email
- [ ] ✅ You see in-app notification

### Test 2: Only Email
- [ ] Go to Settings
- [ ] Set Email Notifications = ON
- [ ] Set In-App Notifications = OFF
- [ ] Save Changes
- [ ] Have teacher assign a quiz
- [ ] ✅ You receive email
- [ ] ❌ No in-app notification

### Test 3: Only In-App
- [ ] Go to Settings
- [ ] Set Email Notifications = OFF
- [ ] Set In-App Notifications = ON
- [ ] Save Changes
- [ ] Have teacher assign a quiz
- [ ] ❌ No email received
- [ ] ✅ You see in-app notification

### Test 4: Both Disabled
- [ ] Go to Settings
- [ ] Set Email Notifications = OFF
- [ ] Set In-App Notifications = OFF
- [ ] Save Changes
- [ ] Have teacher assign a quiz
- [ ] ❌ No email received
- [ ] ❌ No in-app notification
- [ ] ✅ Notification bell shows 0

### Test 5: Use Test Endpoint
- [ ] API call: `POST /api/notifications/test`
- [ ] ✅ Check email inbox
- [ ] ✅ Check notification center
- [ ] ✅ Response shows what was sent/created

---

## Common Questions

**Q: I disabled email notifications but still getting emails?**
A: Try refreshing the page. If still not working:
1. Go to Settings again
2. Verify it shows OFF
3. Try saving again
4. Check server logs for errors

**Q: I don't see notifications in the app?**
A: Check:
1. Is "In-App Notifications" toggled ON in Settings?
2. Have you saved the changes?
3. Is there a notification to show? (Try using test endpoint)
4. Try refreshing the page

**Q: Do settings change immediately?**
A: Yes! As soon as you click "Save Changes":
- Settings are saved to database
- Take effect immediately
- New notifications will respect the new settings
- Old notifications remain unchanged

**Q: Can I change settings multiple times?**
A: Yes, absolutely! You can toggle settings on/off as many times as you want. Each time you save:
- Settings update in database
- New setting takes effect
- Confirmation email sent (if email enabled)

**Q: What if I accidentally disable both?**
A: No worries! Just:
1. Go back to Settings
2. Toggle whichever you want back ON
3. Click Save
4. Done! You'll start receiving notifications again

---

## For Administrators

### Manage User Notifications

**View a student's settings:**
1. Go to User Management
2. Click on student name
3. Go to Settings tab
4. See their current notification preferences

**Override a student's settings:**
1. Go to User Management
2. Click on student name
3. Go to Settings tab
4. Toggle notification preferences
5. Click "Save by Admin"
6. ✅ Settings updated
7. 📧 Confirmation email sent to student (if email enabled)

### Debug Issues

**Check if settings are saved:**
```bash
# Get user's settings
curl http://localhost:5000/api/notifications/settings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Test if notifications work:**
```bash
# Test notifications
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"both"}'
```

**View server logs:**
- Look for 🔕 (disabled) messages
- Look for ✅ (success) messages
- Look for ❌ (error) messages

---

## Troubleshooting

### Issue: Email notifications not working
**Try this:**
1. [ ] Go to Settings
2. [ ] Ensure email notifications are ON
3. [ ] Click Save Changes
4. [ ] Check your email inbox (including spam)
5. [ ] If no email, try test endpoint: `POST /api/notifications/test`
6. [ ] Check server logs for 📧 Email errors

### Issue: In-app notifications not showing
**Try this:**
1. [ ] Go to Settings
2. [ ] Ensure in-app notifications are ON
3. [ ] Click Save Changes
4. [ ] Refresh the page
5. [ ] Open notification center (bell icon)
6. [ ] Try test endpoint to create a test notification
7. [ ] Check browser console for errors

### Issue: Settings not saving
**Try this:**
1. [ ] Make sure you're logged in
2. [ ] Try clicking Save again
3. [ ] Refresh the page
4. [ ] Check that settings show your changes
5. [ ] Try logging out and back in
6. [ ] Check browser console for errors

### Issue: Getting both email and notifications but want only one
**Do this:**
1. [ ] Go to Settings
2. [ ] Turn OFF the one you don't want
3. [ ] Turn ON the one you do want
4. [ ] Click Save Changes
5. [ ] Done!

---

## Feature Overview

### Email Notifications
**When sent:**
- ✅ Quiz assigned to you
- ✅ Quiz graded by teacher
- ✅ Your settings changed
- ✅ Profile updated
- ✅ Important announcements

**What's in the email:**
- Quiz title and subject
- Teacher/instructor name
- Deadline (if applicable)
- Score (if graded)
- Link to view details

### In-App Notifications
**When shown:**
- ✅ Quiz assigned to you
- ✅ Quiz graded by teacher
- ✅ Important announcements
- ✅ System updates

**What you can do:**
- Mark as read
- Delete individual notifications
- View unread count on bell icon
- Click to navigate to quiz/announcement

---

## File Locations

### Backend Code
- `backend/src/controllers/notificationController.js` - Notification logic
- `backend/src/services/notificationEmail.service.js` - Email sending
- `backend/src/routes/notificationRoutes.js` - API routes
- `backend/src/models/notification.js` - Database schema

### Frontend Code
- `frontend/src/pages/StudentProfile.jsx` - Student settings
- `frontend/src/pages/TeacherProfile.jsx` - Teacher settings
- `frontend/src/components/NotificationCenter.jsx` - Notification display

### Documentation
- `NOTIFICATION_SYSTEM.md` - Complete reference
- `NOTIFICATION_SETUP_VERIFICATION.md` - Verification checklist
- `NOTIFICATION_IMPLEMENTATION_COMPLETE.md` - Implementation summary

### Testing
- `test-notification-system.js` - Automated test script

---

## Support

### Still having issues?

1. **Check the documentation:**
   - Read `NOTIFICATION_SYSTEM.md` for complete reference
   - Check `NOTIFICATION_SETUP_VERIFICATION.md` for troubleshooting

2. **Run the test script:**
   - `node test-notification-system.js`
   - This tests everything and shows detailed output

3. **Check console logs:**
   - Browser console (press F12)
   - Server logs (where Node.js is running)

4. **Contact support:**
   - emexaed@gmail.com
   - Include your user email and what you tried to fix the issue

---

## That's It! 🎉

Your notification system is now fully functional. You have complete control over which notifications you receive and how you receive them.

**Enjoy using EMEXA!**

