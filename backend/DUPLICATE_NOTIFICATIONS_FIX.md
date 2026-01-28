# Duplicate Quiz Notifications - Fix Documentation

## Problem
Students were receiving duplicate quiz assignment notifications when teachers clicked the "Share Quiz" button multiple times. This happened due to:

1. **Race Condition**: Multiple rapid clicks sent simultaneous requests to the backend before the first notification was saved
2. **No Frontend Protection**: The Share button didn't prevent multiple clicks
3. **Weak Database Constraints**: No unique constraint at the database level to prevent duplicates

## Solution Implemented

### 1. Database Level Protection (Backend)
**File**: `backend/src/models/notification.js`

Added a unique compound index to prevent duplicate quiz assignment notifications:
```javascript
notificationSchema.index(
  { recipientId: 1, quizId: 1, type: 1 },
  { 
    unique: true, 
    partialFilterExpression: { 
      type: 'quiz_assigned',
      quizId: { $exists: true } 
    }
  }
);
```

This ensures that each student (recipientId) can only have ONE notification for each quiz (quizId) of type 'quiz_assigned'.

### 2. Improved Duplicate Check (Backend)
**File**: `backend/src/controllers/notificationController.js`

- Changed from `.find()` to `.countDocuments()` for faster duplicate checking
- Added `ordered: false` to `insertMany()` to handle race conditions gracefully
- Added error handling for duplicate key errors (E11000)

### 3. Button State Management (Frontend)
**File**: `frontend/src/pages/TeacherQuizDraft.jsx`

- Added `isSharing` state variable
- Disabled the "Share Quiz" button during the share operation
- Shows loading spinner with "Sharing..." text
- Prevents multiple simultaneous submissions

```javascript
const [isSharing, setIsSharing] = useState(false);

const handleShareQuiz = async () => {
  if (isSharing) return; // Prevent duplicate clicks
  
  setIsSharing(true);
  try {
    // ... share logic
  } finally {
    setIsSharing(false);
  }
};
```

## Migration Script

A migration script is provided to clean up existing duplicate notifications:

**File**: `backend/scripts/removeDuplicateNotifications.js`

### Running the Migration

**Important**: Make sure your MongoDB database is running and accessible before running the migration.

```bash
cd backend
node scripts/removeDuplicateNotifications.js
```

**Note**: If you're using a cloud database (MongoDB Atlas) or the database is not running locally, the migration will run automatically when you:
1. Restart the backend server
2. The unique index will be created automatically
3. Any existing duplicates will be prevented from being created in the future

### Alternative: Let it Run Automatically

If you don't want to run the migration manually:
1. The unique index is automatically created when the Notification model loads
2. Existing duplicates won't cause issues, they'll just coexist
3. No NEW duplicates can be created after the fix is deployed

This script will:
1. Connect to your MongoDB database
2. Find all duplicate quiz assignment notifications
3. Keep the oldest notification for each student/quiz combination
4. Remove all duplicates
5. Create the unique compound index
6. Display a summary of actions taken

### What the Migration Does:
- ✅ Removes duplicate notifications
- ✅ Creates the unique index
- ✅ Protects against future duplicates
- ✅ Safe to run multiple times (idempotent)

## Testing the Fix

### Test Case 1: Multiple Button Clicks
1. As a teacher, create and schedule a quiz
2. Click the "Share Quiz" button multiple times rapidly
3. **Expected Result**: Button becomes disabled with "Sharing..." text
4. **Expected Result**: Only ONE notification is created for each student

### Test Case 2: Duplicate API Requests
1. Use Postman or similar tool to send multiple simultaneous POST requests to schedule a quiz
2. **Expected Result**: Only ONE set of notifications is created
3. **Expected Result**: Subsequent requests return "Notifications already exist"

### Test Case 3: Notification List
1. As a student, check the notifications page
2. **Expected Result**: No duplicate notifications for the same quiz
3. **Expected Result**: Each quiz appears only once in the notification list

## Verification

After running the migration script, verify the fix:

```bash
# Check MongoDB for the unique index
mongo emexa
db.notifications.getIndexes()

# Look for: "unique_quiz_assignment" index
# Should show: { recipientId: 1, quizId: 1, type: 1 }
```

## Rollback (if needed)

If you need to remove the unique index for any reason:

```javascript
// In MongoDB shell or script
db.notifications.dropIndex("unique_quiz_assignment");
```

## Benefits

✅ **No More Duplicates**: Database-level constraint prevents duplicates  
✅ **Better UX**: Loading state provides visual feedback  
✅ **Performance**: Uses `.countDocuments()` instead of `.find()`  
✅ **Resilient**: Handles race conditions gracefully  
✅ **Automatic**: Works for all future quiz shares  

## Technical Details

### Index Properties:
- **Type**: Unique compound index
- **Fields**: recipientId + quizId + type
- **Partial Filter**: Only applies to quiz_assigned notifications with quizId
- **Name**: unique_quiz_assignment

### Error Handling:
- Duplicate key errors (E11000) are caught and handled gracefully
- Frontend shows appropriate error messages
- Backend logs provide detailed debugging information

## Maintenance

The unique index is created automatically when:
1. The Notification model is initialized
2. The migration script is run
3. MongoDB creates the index on first insert (if not exists)

No ongoing maintenance is required. The protection is permanent and automatic.
