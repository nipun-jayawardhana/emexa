# AI Enhancement Setup Guide

## ✅ Backend Setup Complete!

All AI features have been integrated into your EMEXA project.

### 📁 Files Created:

**Models:**
- `backend/src/models/emotionLog.js` - Stores emotion detection data
- `backend/src/models/hintUsage.js` - Tracks AI hints with deductions
- `backend/src/models/quizAttempt.js` - Stores quiz results with AI feedback

**Controllers:**
- `backend/src/controllers/emotionController.js` - Emotion detection logic
- `backend/src/controllers/hintController.js` - AI hint generation
- `backend/src/controllers/feedbackController.js` - Personalized feedback

**Routes:**
- `backend/src/routes/emotionRoutes.js` - `/api/emotion` endpoints
- `backend/src/routes/hintRoutes.js` - `/api/hint` endpoints
- `backend/src/routes/feedbackRoutes.js` - `/api/feedback` endpoints

**WebSocket:**
- `backend/src/socket/emotionSocket.js` - Real-time emotion tracking via Socket.IO

**Server:**
- `backend/server.js` - Updated with Socket.IO and AI routes

---

## 🔧 Next Steps:

### 1️⃣ Add Hugging Face API Key

Create or update your `.env` file in the backend folder:

```env
# Existing variables
MONGO_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:5173

# Add this for AI features
HF_API_KEY=your_hugging_face_api_key_here
```

**To get a Hugging Face API key:**
1. Go to https://huggingface.co/
2. Sign up / Log in
3. Go to Settings → Access Tokens
4. Create a new token (read access is enough)
5. Copy and paste it into your `.env` file

---

### 2️⃣ Install Frontend Dependencies

Go to your frontend folder and install Socket.IO client:

```bash
cd frontend
npm install socket.io-client
```

---

### 3️⃣ Test the Backend

Start your backend server:

```bash
cd backend
npm start
```

You should see:
```
🤖 AI Features: ✅ Hugging Face API configured
🔌 WebSocket: ✅ Socket.IO running on /emotion namespace
```

---

## 📡 API Endpoints Available:

### Emotion Detection
- `POST /api/emotion` - Detect emotion from image
- `GET /api/emotion/summary/:sessionId` - Get emotion summary

### Hints
- `POST /api/hint` - Generate AI hint (deducts 1 mark)
- `GET /api/hint/session/:sessionId` - Get all hints used

### Feedback
- `POST /api/feedback` - Generate personalized feedback
- `GET /api/feedback/attempt/:sessionId` - Get quiz attempt
- `GET /api/feedback/user/:userId` - Get all user attempts

### WebSocket
- Connect to: `http://localhost:5000/emotion`
- Events:
  - `emotion-snapshot` - Send webcam image
  - `emotion-detected` - Receive emotion result
  - `emotion-error` - Handle errors

---

## 🎯 How It Works:

### 1. Emotion Tracking (WebSocket)
```javascript
// Frontend connects to WebSocket
const socket = io('http://localhost:5000/emotion');

// Every 60 seconds, capture webcam and send
socket.emit('emotion-snapshot', {
  image: base64Image,
  userId: currentUser._id,
  sessionId: quizSessionId,
  questionIndex: currentQuestionIndex
});

// Listen for emotion result
socket.on('emotion-detected', (data) => {
  console.log('Emotion:', data.emotion);
  // confused, happy, sad, neutral, etc.
});
```

### 2. Adaptive Hints
```javascript
// When student stuck on question > 60 seconds
// OR manually clicks hint button
const response = await fetch('/api/hint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    sessionId,
    questionId,
    questionIndex,
    questionText: "What is React?",
    options: ["Library", "Framework", "Language", "Tool"]
  })
});

const { hint, deduction } = await response.json();
// Display hint, deduct 1 mark
```

### 3. Personalized Feedback
```javascript
// After quiz submission
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    quizId,
    sessionId,
    rawScore: 8,
    totalQuestions: 10,
    answers: [...] // array of answers
  })
});

const { finalScore, feedback, emotionalSummary } = await response.json();
// Display AI-generated personalized feedback
```

---

## 🎨 Frontend Implementation Guide:

### WebSocket Connection (in Quiz Component)
```javascript
import { io } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

const QuizPage = () => {
  const [socket, setSocket] = useState(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const videoRef = useRef(null);
  
  useEffect(() => {
    // Connect to emotion socket
    const emotionSocket = io('http://localhost:5000/emotion');
    setSocket(emotionSocket);
    
    return () => emotionSocket.disconnect();
  }, []);
  
  // Request webcam permission
  const enableWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 224, height: 224 } 
      });
      videoRef.current.srcObject = stream;
      setWebcamEnabled(true);
    } catch (error) {
      console.log('Webcam denied - manual mode');
      setWebcamEnabled(false);
    }
  };
  
  // Capture and send emotion snapshot every 60 seconds
  useEffect(() => {
    if (!webcamEnabled || !socket) return;
    
    const interval = setInterval(() => {
      captureAndSendEmotion();
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [webcamEnabled, socket]);
  
  const captureAndSendEmotion = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 224, 224);
    const base64Image = canvas.toDataURL('image/jpeg');
    
    socket.emit('emotion-snapshot', {
      image: base64Image,
      userId: currentUser._id,
      sessionId: quizSessionId,
      questionIndex: currentQuestionIndex
    });
  };
  
  return (
    <div>
      <video ref={videoRef} autoPlay style={{ display: 'none' }} />
      {/* Quiz UI here */}
    </div>
  );
};
```

---

## 🧪 Testing Checklist:

- [ ] Backend starts without errors
- [ ] HF_API_KEY is set in .env
- [ ] WebSocket connects successfully
- [ ] Emotion detection works with test image
- [ ] Hint generation returns AI-generated text
- [ ] Feedback generation works after quiz
- [ ] Scores calculated correctly (rawScore - hints)

---

## 🚀 Ready to Demo!

Your AI-enhanced quiz system is now ready with:
- ✅ Real-time emotion tracking
- ✅ Adaptive AI hints
- ✅ Personalized feedback
- ✅ Automatic score deduction
- ✅ WebSocket communication

All backend files are created and integrated!
