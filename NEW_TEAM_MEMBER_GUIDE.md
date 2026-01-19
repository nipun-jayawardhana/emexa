# 🎓 New Team Member - Quick Onboarding Guide

Welcome to the EMEXA team! This guide will help you get up to speed with the new **Email Notification System** in 10 minutes.

---

## ⏱️ 10-Minute Quick Start

### What Just Happened? (1 min)
A new **Email Notification System** was added that sends emails to users for important events **only if they have email notifications enabled**.

**The four events:**
1. 📋 Quiz assigned → Email sent
2. ✅ Quiz submitted → Email with score sent
3. ✏️ Profile updated → Email sent
4. ⚙️ Settings changed → Email sent

### How Users Control It (2 min)
**Path:** Profile → Settings → Email Notifications toggle
```
User sees: 🟢 ON (email enabled) or ⚫ OFF (email disabled)
User clicks: Save Changes
Result: Preference saved, emails respect this choice
```

### Where to Find Code (3 min)

**Service File (where emails are sent):**
```
backend/src/services/notificationEmail.service.js
├── sendEmailNotification() ← Main function (checks preference)
├── sendQuizAssignmentEmail() ← Template
├── sendQuizSubmissionEmail() ← Template
├── sendProfileUpdateEmail() ← Template
└── sendSettingsChangeEmail() ← Template
```

**Modified Files (where emails are triggered):**
```
backend/src/controllers/
├── notificationController.js (quiz assignments)
├── quizcontroller.js (quiz submissions)
├── teacherQuizController.js (quiz submissions)
├── userController.js (profile & settings)
└── teacherController.js (profile & settings)
```

### The Magic (2 min)
```javascript
// Before sending ANY email:
1. Fetch user from database
2. Check: emailNotifications flag
3. If TRUE → Send email ✉️
4. If FALSE → Skip email ❌
5. Always → Create in-app notification 📌
```

### Key Rule
**ALWAYS USE `sendEmailNotification()` to send emails!**

✅ CORRECT:
```javascript
await sendEmailNotification(userId, email, subject, htmlContent);
```

❌ WRONG:
```javascript
await transporter.sendMail(...); // Direct send, ignores preference!
```

### Test It (2 min)
```
1. Go to Settings → Email Notifications
2. Toggle OFF
3. Trigger an event (e.g., submit a quiz)
4. Check: No email received ✅
5. Toggle ON
6. Trigger same event
7. Check: Email received ✅
```

---

## 📚 Documentation Guide

**In a rush? Read these:**
- [INDEX.md](INDEX.md) - 2 min overview
- [FINAL_COMPLETION_SUMMARY.md](FINAL_COMPLETION_SUMMARY.md) - 5 min details

**Need to code? Read these:**
- [DEVELOPER_QUICK_START.md](backend/DEVELOPER_QUICK_START.md) - How to use the system
- [QUICK_REFERENCE_EMAIL_NOTIFICATIONS.md](QUICK_REFERENCE_EMAIL_NOTIFICATIONS.md) - Quick lookup

**Need everything? Read these:**
- All documents in INDEX.md (1-2 hours for complete understanding)

---

## 🔧 Common Tasks

### Task 1: Add Email to a New Event
```javascript
// 1. Import the service
import { sendEmailNotification, sendYourEventEmail } from '...'

// 2. Create template in notificationEmail.service.js
export const sendYourEventEmail = async (email, name, ...) => {
  const htmlContent = `<html>...</html>`;
  return htmlContent;
}

// 3. Use in controller
const emailHtml = await sendYourEventEmail(email, name, ...);
await sendEmailNotification(userId, email, subject, emailHtml);
```

### Task 2: Disable Email for a Specific Event
```javascript
// Just comment out the sendEmailNotification line:
// await sendEmailNotification(userId, email, subject, emailHtml);

// Keep in-app notification:
await Notification.create({...});
```

### Task 3: Modify Email Template
Edit the template function in `notificationEmail.service.js`:
```javascript
export const sendQuizAssignmentEmail = async (...) => {
  // Change HTML here
  const htmlContent = `<html>MODIFIED</html>`;
  return htmlContent;
}
```

### Task 4: Debug Email Not Sending
Check the backend console:
1. Look for: `🔕 Email notifications disabled for user`
2. Look for: `❌ Error sending email`
3. Check user's setting in database: `emailNotifications: true/false`

---

## ⚠️ Common Mistakes to Avoid

### ❌ WRONG: Sending email directly
```javascript
await transporter.sendMail(mailOptions); // Ignores user preference!
```

### ✅ CORRECT: Use the service function
```javascript
await sendEmailNotification(userId, email, subject, htmlContent);
```

### ❌ WRONG: Forgetting the preference check
The function doesn't check if user wants emails.

### ✅ CORRECT: Always use sendEmailNotification
It automatically checks the preference.

### ❌ WRONG: Creating email without template
```javascript
const htmlContent = "Hello user"; // Plain text, looks bad
```

### ✅ CORRECT: Use email templates
```javascript
const htmlContent = await sendQuizAssignmentEmail(...);
// Professional HTML with styling
```

---

## 🎯 What You Need to Know

### File Structure
```
new file:
- notificationEmail.service.js (340 lines, 5 functions)

modified files:
- notificationController.js (+30 lines)
- quizcontroller.js (+35 lines)
- teacherQuizController.js (+35 lines)
- userController.js (+90 lines)
- teacherController.js (+90 lines)
```

### Key Functions
```javascript
// Main function - CHECK THIS!
sendEmailNotification(userId, email, subject, html)

// Email templates
sendQuizAssignmentEmail()
sendQuizSubmissionEmail()
sendProfileUpdateEmail()
sendSettingsChangeEmail()
```

### Database Fields
```javascript
User: notificationSettings.emailNotifications (true/false)
Teacher: settings.emailNotifications (true/false)
```

### Environment Variables
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 First Day To-Do

- [ ] Read [INDEX.md](INDEX.md)
- [ ] Read [FINAL_COMPLETION_SUMMARY.md](FINAL_COMPLETION_SUMMARY.md)
- [ ] Look at `notificationEmail.service.js`
- [ ] Look at one modified controller (e.g., `userController.js`)
- [ ] Test email notifications ON and OFF
- [ ] Ask questions in team Slack
- [ ] Read [DEVELOPER_QUICK_START.md](backend/DEVELOPER_QUICK_START.md) if modifying code

---

## 💡 Pro Tips

### Tip 1: Templates are HTML
All email templates are HTML strings with CSS. They're responsive and beautiful. Look at them for inspiration when creating new emails.

### Tip 2: Error Handling Works
If email sending fails:
- ❌ Email not sent
- 📌 In-app notification still created
- ✅ App doesn't crash
- 📝 Error logged to console

### Tip 3: Always Check Preference
The `sendEmailNotification()` function automatically checks the user's preference. Don't bypass it!

### Tip 4: Test Both ON and OFF
When testing emails, always test with:
1. Email notifications ON → Should get email
2. Email notifications OFF → Should NOT get email
3. Both should have in-app notification

### Tip 4: Use Templates
Never send plain text emails. Always use the template functions.

---

## ❓ FAQ - New Member Edition

**Q: Where do I find the email sending code?**
A: `backend/src/services/notificationEmail.service.js`

**Q: How do I add a new email?**
A: Create a template function in `notificationEmail.service.js`, then use `sendEmailNotification()` in your controller.

**Q: What if the user doesn't want emails?**
A: `sendEmailNotification()` checks this automatically and skips the email. In-app notification is still created.

**Q: Can I bypass the preference check?**
A: You could, but DON'T. Users control their own notifications. Respect their choice.

**Q: What if email sending fails?**
A: The app continues working. In-app notification is created as backup. Error is logged.

**Q: Do I need to create in-app notifications separately?**
A: Yes, `sendEmailNotification()` only sends emails. You still need to create in-app notifications.

**Q: Where's the database preference stored?**
A: 
- User/Student: `notificationSettings.emailNotifications`
- Teacher: `settings.emailNotifications`

**Q: Can I test without Gmail?**
A: Yes, comment out the `transporter.sendMail()` line and just log. Or use Mailtrap.

**Q: What email templates exist?**
A: 4 templates for quiz assignment, quiz submission, profile update, and settings change.

---

## 🎓 Learning Path

### Week 1: Understanding
- [ ] Read all documentation
- [ ] Understand the 4 email types
- [ ] Understand preference checking
- [ ] Know where code is located

### Week 2: Working with Code
- [ ] Look at one template function
- [ ] Trace how email is sent
- [ ] Understand error handling
- [ ] Test email notifications

### Week 3: Modifying
- [ ] Modify an email template
- [ ] Add a new email event
- [ ] Test thoroughly
- [ ] Get code review

### Week 4: Mastery
- [ ] Understand all email flows
- [ ] Can add new features
- [ ] Can fix bugs
- [ ] Can help others

---

## 📞 Getting Help

**Questions about:**
- **What it does** → Read [FINAL_COMPLETION_SUMMARY.md](FINAL_COMPLETION_SUMMARY.md)
- **How it works** → Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Code structure** → Read [DEVELOPER_QUICK_START.md](backend/DEVELOPER_QUICK_START.md)
- **Specific change** → Read [DETAILED_CODE_CHANGES.md](backend/DETAILED_CODE_CHANGES.md)
- **Visual diagrams** → Read [VISUAL_ARCHITECTURE.md](VISUAL_ARCHITECTURE.md)
- **Quick reference** → Use [QUICK_REFERENCE_EMAIL_NOTIFICATIONS.md](QUICK_REFERENCE_EMAIL_NOTIFICATIONS.md)
- **Overall** → Start with [INDEX.md](INDEX.md)

---

## ✅ You're Ready!

You now know:
- ✅ What the email system does
- ✅ How users control it
- ✅ Where the code is
- ✅ How to work with it
- ✅ What to do if something breaks
- ✅ Where to find answers

### Next Step
Go read [INDEX.md](INDEX.md) for a full overview, then start exploring the code!

---

**Welcome to the team! 🎉**

Questions? Check the documentation or ask in Slack!

Date: January 19, 2026
Created for: New EMEXA team members
Status: Ready to share
