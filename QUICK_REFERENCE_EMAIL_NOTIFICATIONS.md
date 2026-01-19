# Email Notification Quick Reference

## What Was Implemented?

### ✅ Automatic Email Notifications Based on User Preferences

Users can now toggle email notifications ON/OFF in their Settings. The system respects this preference:

| Action | Email Notifications ON | Email Notifications OFF |
|--------|----------------------|------------------------|
| **Quiz Assigned** | ✅ Email sent + In-app notification | ❌ No email, In-app notification only |
| **Quiz Submitted** | ✅ Email with score + In-app notification | ❌ No email, In-app notification only |
| **Profile Updated** | ✅ Confirmation email + In-app notification | ❌ No email, In-app notification only |
| **Settings Changed** | ✅ Settings email + In-app notification | ❌ No email, In-app notification only |

## How Users Toggle Email Notifications

1. Go to **Profile → Settings**
2. Find **"Email Notifications"** toggle
3. Toggle **ON** (green) or **OFF** (grey)
4. Click **"Save Changes"**
5. Preference is saved immediately

## Email Examples

### 1. Quiz Assignment Email
```
Subject: 📋 New Quiz Assigned: [Quiz Title]
From: EMEXA System
To: student@example.com

Content includes:
- Quiz title
- Subject area
- Instructor name
- Instructions to log in and complete
```

### 2. Quiz Submission Email
```
Subject: ✅ Quiz Submitted: [Quiz Title]
From: EMEXA System
To: student@example.com

Content includes:
- Quiz title
- Score percentage (e.g., 85%)
- Link to view detailed feedback
```

### 3. Profile Update Email
```
Subject: ✏️ Profile Updated - EMEXA
From: EMEXA System
To: user@example.com

Content includes:
- Confirmation of profile update
- Timestamp
- Security warning if unauthorized
```

### 4. Settings Change Email
```
Subject: ⚙️ Settings Updated - EMEXA
From: EMEXA System
To: user@example.com

Content includes:
- List of changed settings
- New values (Enabled/Disabled)
- Security warning
```

## Technical Details

### Service File
```
src/services/notificationEmail.service.js
- sendEmailNotification() ← Main function (checks preference first)
- sendQuizAssignmentEmail()
- sendQuizSubmissionEmail()
- sendProfileUpdateEmail()
- sendSettingsChangeEmail()
```

### Modified Controllers
```
1. notificationController.js
   ✓ createQuizNotification() - sends quiz assignment emails

2. quizcontroller.js
   ✓ submitQuizAnswers() - sends submission confirmation emails

3. teacherQuizController.js
   ✓ submitQuizAnswers() - sends submission confirmation emails

4. userController.js
   ✓ updateProfile() - sends profile update email
   ✓ updateNotificationSettings() - sends settings change email

5. teacherController.js
   ✓ updateProfile() - sends profile update email
   ✓ updateSettings() - sends settings change email
```

## Key Features

✨ **Smart Notification System**
- Checks user preference before sending each email
- Respects both `notificationSettings` (Student/User) and `settings` (Teacher)
- Gracefully handles missing emails or user data

📧 **Beautiful Email Templates**
- Professional HTML formatting
- Color-coded by notification type
- Responsive design for mobile
- EMEXA branding and footer

🔒 **Security**
- Includes security warnings in sensitive emails
- Prevents unauthorized changes notification
- Logs all email operations

⚡ **Reliable**
- Email failures don't break the application
- In-app notifications always created as backup
- All errors logged for debugging

## Testing Checklist

- [ ] Turn OFF email notifications in settings
- [ ] Trigger a quiz assignment - verify NO email received
- [ ] Turn ON email notifications in settings
- [ ] Trigger a quiz assignment - verify email received
- [ ] Submit a quiz - verify email with score
- [ ] Update profile - verify profile update email
- [ ] Change settings - verify settings change email
- [ ] Check all emails are properly formatted
- [ ] Verify in-app notifications exist regardless of email setting

## Troubleshooting

**Not receiving emails?**
1. Check Settings → Email Notifications is toggled ON
2. Check email/GMAIL_APP_PASSWORD environment variables are set
3. Check backend console for email sending errors
4. Verify user email address in database is correct

**Emails have wrong content?**
1. Check email templates in notificationEmail.service.js
2. Verify quiz/user data being passed is correct
3. Check browser console for any frontend errors

**In-app notifications not showing?**
1. Verify notification was created in database
2. Check Notification model is imported correctly
3. Verify recipientId is being set correctly

## Email Configuration

```
Environment Variables needed:
EMAIL_USER = your-gmail@gmail.com
EMAIL_PASSWORD = your-gmail-app-password
FRONTEND_URL = http://localhost:5173 (or production URL)
```

**Note:** Gmail requires an App Password, not your regular password.
See: https://support.google.com/accounts/answer/185833
