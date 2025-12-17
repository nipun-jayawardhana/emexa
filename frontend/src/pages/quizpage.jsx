import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Clock,
  Home,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Flag,
} from "lucide-react";
import { io } from "socket.io-client";
import teacherQuizService from "../services/teacherQuizService";
import headerLogo from "../assets/headerlogo.png";
import DownloadIcon from "../assets/download.png";

const QuizPage = () => {
  const { quizId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem("flaggedQuestions");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });
  const [timeOnQuestion, setTimeOnQuestion] = useState(0);
  const [showBulb, setShowBulb] = useState(false);
  const [showEmojiDialog, setShowEmojiDialog] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all"); // Start with NO filter selected
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Integration States
  const [sessionId] = useState(
    `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [aiHints, setAiHints] = useState({});
  const [aiFeedback, setAiFeedback] = useState(null);
  const [emotionSocket, setEmotionSocket] = useState(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const videoRef = useRef(null);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);

  // Load quiz data on component mount
  useEffect(() => {
    loadQuizData();
    initializeAI();

    return () => {
      // Cleanup on unmount
      if (emotionSocket) {
        emotionSocket.disconnect();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [quizId]);

  // Initialize AI features (Socket.IO + Webcam if available)
  const initializeAI = async () => {
    try {
      // Get user info from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);

      // Connect to emotion tracking socket
      const socket = io("http://localhost:5000/emotion", {
        transports: ["websocket"],
        reconnection: true,
      });

      socket.on("connect", () => {
        console.log("🤖 AI: Connected to emotion tracking");
        socket.emit("join-session", sessionId);
      });

      socket.on("emotion-detected", (data) => {
        console.log(
          "😊 AI: Emotion detected -",
          data.emotion,
          `(${Math.round(data.confidence * 100)}%)`
        );
      });

      socket.on("emotion-error", (error) => {
        console.error("❌ AI: Emotion error", error);
      });

      setEmotionSocket(socket);

      // Try to enable webcam (optional - won't break if no camera)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 224, height: 224 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setWebcamEnabled(true);
          console.log("📷 AI: Webcam enabled for emotion tracking");
        }
      } catch (err) {
        console.log("⚠️ AI: Webcam not available - manual mode enabled");
        setWebcamEnabled(false);
      }
    } catch (error) {
      console.error("AI initialization error:", error);
    }
  };

  // Capture and send emotion snapshot every 60 seconds
  useEffect(() => {
    if (!webcamEnabled || !emotionSocket || quizSubmitted) return;

    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const captureEmotion = () => {
      if (!videoRef.current) return;

      const canvas = document.createElement("canvas");
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, 224, 224);
      const base64Image = canvas.toDataURL("image/jpeg");

      emotionSocket.emit("emotion-snapshot", {
        image: base64Image,
        userId: user._id,
        sessionId: sessionId,
        questionIndex: currentQuestion,
      });
    };

    // Capture immediately on question change
    captureEmotion();

    // Then every 60 seconds
    const interval = setInterval(captureEmotion, 60000);

    return () => clearInterval(interval);
  }, [webcamEnabled, emotionSocket, currentQuestion, quizSubmitted]);

  const loadQuizData = async () => {
    try {
      console.log("Quiz Page - Loading quiz with ID:", quizId);
      console.log("Quiz Page - URL:", window.location.href);

      // Get quiz ID from URL path parameter
      if (quizId) {
        try {
          // Try to load from backend first
          const response = await teacherQuizService.getSharedQuizzes();
          console.log("Quiz Page - All shared quizzes from backend:", response);

          const teacherQuiz = response.quizzes.find((q) => {
            console.log(
              `Comparing quiz._id (${q._id}) with quizId (${quizId})`
            );
            return String(q._id) === String(quizId) || q._id == quizId;
          });

          console.log("Quiz Page - Found teacher quiz:", teacherQuiz);

          if (teacherQuiz) {
            console.log(
              "Quiz Page - Teacher quiz questions:",
              teacherQuiz.questions
            );

            if (teacherQuiz.questions && teacherQuiz.questions.length > 0) {
              // Convert teacher quiz format to quiz page format
              const formattedQuestions = teacherQuiz.questions.map(
                (q, index) => ({
                  id: index + 1,
                  text: q.questionText,
                  type: q.type, // 'mcq' or 'short'
                  options:
                    q.type === "mcq" ? q.options.map((opt) => opt.text) : [],
                  correctAnswer:
                    q.type === "mcq"
                      ? q.options.findIndex((opt) => opt.isCorrect)
                      : null,
                  hints: q.hints || ["", "", "", ""],
                  shortAnswer: q.shortAnswer || "",
                })
              );

              console.log(
                "Quiz Page - Formatted questions:",
                formattedQuestions
              );

              setQuizData({
                title: teacherQuiz.title,
                subject: teacherQuiz.subject,
                questions: formattedQuestions,
              });
              setLoading(false);
              console.log(
                "Quiz Page - Successfully loaded teacher quiz from backend!"
              );
              return;
            } else {
              console.warn("Quiz Page - Teacher quiz found but no questions!");
            }
          } else {
            console.warn(
              "Quiz Page - No matching teacher quiz found for ID:",
              quizId
            );
          }
        } catch (apiError) {
          console.error("Quiz Page - Error loading from backend:", apiError);
        }
      } else {
        console.warn("Quiz Page - No quizId provided in URL");
      }

      // Fallback to default sample quiz
      console.log("Quiz Page - Falling back to sample Biology quiz");
      setQuizData({
        title: "Introduction to Biology",
        questions: sampleQuestions,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading quiz:", error);
      // Fallback to default sample quiz
      setQuizData({
        title: "Introduction to Biology",
        questions: sampleQuestions,
      });
      setLoading(false);
    }
  };

  const sampleQuestions = [
    {
      id: 1,
      text: "Which of the following is NOT a characteristic of living organisms?",
      options: [
        "Growth and development",
        "Response to environment",
        "Crystalline structure",
        "Reproduction",
      ],
      correctAnswer: 2,
      hints: [
        "This process occurs in plants and some bacteria.",
        "It involves the conversion of carbon dioxide and water into glucose and oxygen.",
        "Chlorophyll is essential for this process.",
        "The answer is related to photosynthesis characteristics.",
      ],
    },
    {
      id: 2,
      text: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic reticulum"],
      correctAnswer: 1,
      hints: [
        "This organelle is responsible for energy production.",
        "It produces ATP through cellular respiration.",
        "It has its own DNA.",
        "Often called the energy factory of the cell.",
      ],
    },
    {
      id: 3,
      text: "Which of the following is NOT a nucleotide found in DNA?",
      options: ["Adenine", "Guanine", "Uracil", "Cytosine"],
      correctAnswer: 2,
      hints: [
        "DNA contains four bases.",
        "This nucleotide is found in RNA, not DNA.",
        "Thymine replaces this base in DNA.",
        "The answer starts with 'U'.",
      ],
    },
    {
      id: 4,
      text: "Which organelle is responsible for protein synthesis?",
      options: ["Golgi apparatus", "Lysosome", "Ribosome", "Peroxisome"],
      correctAnswer: 2,
      hints: [
        "These are found on the rough endoplasmic reticulum.",
        "They translate mRNA into proteins.",
        "They can be free-floating or attached.",
        "They read messenger RNA sequences.",
      ],
    },
    {
      id: 5,
      text: "Which of the following is NOT a function of proteins in the human body?",
      options: [
        "Energy storage",
        "Structural support",
        "Transport of substances",
        "Catalyzing biochemical reactions",
      ],
      correctAnswer: 0,
      hints: [
        "Proteins have many functions but one is primarily handled by other molecules.",
        "Fats and carbohydrates are better suited for this function.",
        "This is not a primary role of proteins.",
        "Think about what lipids do better than proteins.",
      ],
    },
  ];

  // Timer effect for current question
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnQuestion((prev) => prev + 1);
      if (timeOnQuestion >= 60 && !showBulb && !answers[currentQuestion]) {
        setShowBulb(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeOnQuestion, showBulb, currentQuestion, answers]);

  // Overall quiz timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTime(Math.floor((Date.now() - quizStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStartTime]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeOnQuestion(0);
    setShowBulb(false);
    setShowEmojiDialog(false);
    setShowHints(false);
    setRevealedHints([]);
  }, [currentQuestion]);

  // Persist flagged questions to localStorage
  useEffect(() => {
    localStorage.setItem("flaggedQuestions", JSON.stringify(flaggedQuestions));
  }, [flaggedQuestions]);

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleToggleFlag = (index) => {
    if (flaggedQuestions.includes(index)) {
      setFlaggedQuestions(flaggedQuestions.filter((q) => q !== index));
    } else {
      setFlaggedQuestions([...flaggedQuestions, index]);
    }
  };

  const handleBulbClick = async () => {
    // Check if AI hint already generated for this question
    if (aiHints[currentQuestion]) {
      setShowHints(true);
      return;
    }

    // Generate AI hint
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setShowEmojiDialog(true);
        return;
      }

      const user = JSON.parse(userStr);
      const question = quizData.questions[currentQuestion];

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          sessionId: sessionId,
          questionId: question.id,
          questionIndex: currentQuestion,
          questionText: question.text,
          options: question.options || [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("💡 AI Hint generated:", data.data.hint);

        // Store AI hint
        setAiHints({
          ...aiHints,
          [currentQuestion]: data.data.hint,
        });

        // Increment hints used count
        if (!data.data.alreadyRequested) {
          setHintsUsedCount((prev) => prev + 1);
        }

        setShowHints(true);
      }
    } catch (error) {
      console.error("Error generating AI hint:", error);
      // Fallback to emoji dialog
      setShowEmojiDialog(true);
    }
  };

  const handleEmojiClick = (emoji) => {
    if (emoji === "confused" || emoji === "frustrated") {
      setShowHints(true);
    } else {
      // For happy, neutral, excited - don't show hints
      setShowHints(false);
    }
    setShowEmojiDialog(false);
  };

  const handleRevealHint = (index) => {
    setRevealedHints([...revealedHints, index]);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Generate AI feedback
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const rawScore = calculateScore();

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user._id,
            quizId: quizId,
            sessionId: sessionId,
            rawScore: rawScore,
            totalQuestions: quizData.questions.length,
            answers: Object.entries(answers).map(([index, answer]) => ({
              questionId: quizData.questions[index].id,
              selectedAnswer: answer,
              isCorrect: answer === quizData.questions[index].correctAnswer,
            })),
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log("🎯 AI Feedback generated:", data.data.feedback);
          console.log(
            "📊 Final Score:",
            data.data.finalScore,
            "/",
            quizData.questions.length
          );
          console.log("💡 Hints Used:", data.data.hintsUsed);

          setAiFeedback(data.data);
        }
      }
    } catch (error) {
      console.error("Error generating AI feedback:", error);
    }

    setQuizSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if question matches current filter
  const matchesFilter = (index) => {
    const answered = answers[index] !== undefined;
    const isCurrent = index === currentQuestion;
    const isFlagged = flaggedQuestions.includes(index);

    if (activeFilter === "all") return true;
    if (activeFilter === "current") return isCurrent;
    if (activeFilter === "answered") return answered;
    if (activeFilter === "unanswered") return !answered;

    return true;
  };

  // Count flagged questions
  const flaggedCount = flaggedQuestions.length;

  const handleFilterClick = (filter) => {
    // Always switch to the clicked filter (don't toggle off)
    setActiveFilter(filter);
  };

  const handleDownloadPDF = () => {
    // Create a printable version
    const printWindow = window.open("", "_blank");
    const score = calculateScore();
    const percentage = Math.round((score / quizData.questions.length) * 100);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quiz Results - ${quizData.title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto;
          }
          .header { 
            background: #0f766e; 
            color: white; 
            padding: 20px; 
            margin: -40px -40px 30px -40px;
            border-radius: 8px 8px 0 0;
          }
          .header h1 { margin: 0; font-size: 24px; }
          .success { text-align: center; margin-bottom: 30px; }
          .success h2 { color: #047857; margin-bottom: 10px; }
          .summary { 
            background: #f0fdfa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px;
          }
          .summary-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px;
            color: #1f2937;
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            text-align: center;
          }
          .summary-item label { 
            display: block; 
            font-size: 12px; 
            color: #6b7280; 
            margin-bottom: 5px;
          }
          .summary-item value { 
            display: block; 
            font-weight: bold; 
            color: #1f2937;
          }
          .score-box { 
            background: #fef2f2; 
            border-left: 4px solid #ef4444; 
            padding: 20px; 
            margin-bottom: 30px;
          }
          .score-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 15px;
          }
          .score-header h3 { margin: 0; font-size: 20px; }
          .score-percentage { 
            font-size: 36px; 
            font-weight: bold; 
            color: #ef4444;
          }
          .question-box { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .question-header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 15px;
          }
          .question-title { 
            font-weight: bold; 
            color: #1f2937; 
            flex: 1;
          }
          .answer-box { 
            padding: 12px; 
            border-radius: 8px; 
            margin-bottom: 10px;
          }
          .correct-answer { background: #f0fdf4; }
          .wrong-answer { background: #fef2f2; }
          .explanation { background: #eff6ff; }
          .answer-label { 
            font-size: 12px; 
            color: #6b7280; 
            margin-bottom: 5px;
          }
          .answer-text { 
            font-weight: 500; 
            margin: 0;
          }
          .correct-text { color: #166534; }
          .wrong-text { color: #991b1b; }
          .explanation-text { color: #1e40af; }
          .status-icon { 
            font-size: 20px; 
            margin-left: 10px;
          }
          @media print {
            body { padding: 20px; }
            .header { margin: -20px -20px 20px -20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Quiz Results: ${quizData.title}</h1>
        </div>
        
        <div class="success">
          <h2>Quiz Successfully Submitted!</h2>
          <p>Thank you for completing the quiz. Your responses have been recorded.</p>
        </div>
        
        <div class="summary">
          <div class="summary-title">⭐ Quiz Summary</div>
          <div class="summary-grid">
            <div class="summary-item">
              <label>Date Submitted:</label>
              <value>${new Date().toLocaleDateString()}</value>
            </div>
            <div class="summary-item">
              <label>Time Taken:</label>
              <value>${Math.floor(totalTime / 60)} minutes</value>
            </div>
            <div class="summary-item">
              <label>Questions Answered:</label>
              <value>${Object.keys(answers).length} of ${
      quizData.questions.length
    }</value>
            </div>
          </div>
        </div>
        
        <div class="score-box">
          <div class="score-header">
            <h3>Your Score</h3>
            <div class="score-percentage">${percentage}%</div>
          </div>
          <p>You answered <strong>${score} out of ${
      quizData.questions.length
    }</strong> questions correctly</p>
        </div>
        
        ${quizData.questions
          .map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect =
              question.type === "mcq"
                ? userAnswer === question.correctAnswer
                : false;

            return `
            <div class="question-box">
              <div class="question-header">
                <div class="question-title">
                  Question ${question.id}: ${question.text}
                </div>
                ${
                  question.type === "mcq"
                    ? `<span class="status-icon">${
                        isCorrect ? "✓" : "✗"
                      }</span>`
                    : ""
                }
              </div>
              
              ${
                userAnswer !== undefined && userAnswer !== ""
                  ? `
                <div class="answer-box ${
                  question.type === "mcq"
                    ? isCorrect
                      ? "correct-answer"
                      : "wrong-answer"
                    : "explanation"
                }">
                  <div class="answer-label">Your Answer:</div>
                  <p class="answer-text ${
                    question.type === "mcq"
                      ? isCorrect
                        ? "correct-text"
                        : "wrong-text"
                      : "explanation-text"
                  }">
                    ${
                      question.type === "mcq"
                        ? question.options[userAnswer]
                        : userAnswer
                    }
                  </p>
                </div>
              `
                  : ""
              }
              
              ${
                question.type === "mcq" && !isCorrect
                  ? `
                <div class="answer-box correct-answer">
                  <div class="answer-label">Correct Answer:</div>
                  <p class="answer-text correct-text">${
                    question.options[question.correctAnswer]
                  }</p>
                </div>
              `
                  : ""
              }
              
              ${
                question.type === "short" && question.shortAnswer
                  ? `
                <div class="answer-box correct-answer">
                  <div class="answer-label">Expected Answer:</div>
                  <p class="answer-text correct-text">${question.shortAnswer}</p>
                </div>
              `
                  : ""
              }
              
              <div class="answer-box explanation">
                <div class="answer-label">Explanation:</div>
                <p class="answer-text explanation-text">${
                  question.hints && question.hints[3]
                    ? question.hints[3]
                    : "No explanation available"
                }</p>
              </div>
            </div>
          `;
          })
          .join("")}
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Automatically trigger print dialog with PDF option
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Show loading state
  if (loading || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-700 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizSubmitted) {
    const score = calculateScore();
    const percentage = Math.round((score / quizData.questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8">
          <div className="bg-teal-700 text-white px-6 py-4 rounded-t-xl -mx-8 -mt-8 mb-8">
            <h2 className="text-2xl font-bold">
              Quiz Results: {quizData.title}
            </h2>
          </div>

          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <Check className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              Quiz Successfully Submitted!
            </h3>
            <p className="text-gray-600">
              Thank you for completing the quiz. Your responses have been
              recorded.
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h4 className="text-xl font-semibold text-gray-800">
                Quiz Summary
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm mb-1">Date Submitted:</p>
                <p className="font-semibold text-gray-800">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Time Taken:</p>
                <p className="font-semibold text-gray-800">
                  {Math.floor(totalTime / 60)} minutes
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">
                  Questions Answered:
                </p>
                <p className="font-semibold text-gray-800">
                  {Object.keys(answers).length} of {quizData.questions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Your Score</h3>
              <div className="text-5xl font-bold text-red-500">
                {percentage}%
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              You answered{" "}
              <span className="font-bold">
                {score} out of {quizData.questions.length}
              </span>{" "}
              questions correctly
              {aiFeedback && aiFeedback.hintsUsed > 0 && (
                <span className="text-orange-600">
                  {" "}
                  (- {aiFeedback.hintsUsed} mark
                  {aiFeedback.hintsUsed > 1 ? "s" : ""} for hints)
                </span>
              )}
            </p>
            {aiFeedback && aiFeedback.finalScore !== undefined && (
              <p className="text-gray-700">
                <span className="font-bold">
                  Final Score: {aiFeedback.finalScore} /{" "}
                  {quizData.questions.length}
                </span>
              </p>
            )}
          </div>

          {/* AI Personalized Feedback */}
          {aiFeedback && aiFeedback.feedback && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <div className="flex items-center mb-3">
                <svg
                  className="w-6 h-6 text-blue-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-xl font-bold text-gray-800">
                  🤖 AI Personalized Feedback
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {aiFeedback.feedback}
              </p>
              {aiFeedback.emotionalSummary &&
                aiFeedback.emotionalSummary.totalCaptures > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Emotional Analysis:</span>{" "}
                      {aiFeedback.emotionalSummary.mostCommonEmotion}
                      {aiFeedback.emotionalSummary.confusedCount > 0 &&
                        ` (confusion detected ${
                          aiFeedback.emotionalSummary.confusedCount
                        } time${
                          aiFeedback.emotionalSummary.confusedCount > 1
                            ? "s"
                            : ""
                        })`}
                    </p>
                  </div>
                )}
            </div>
          )}

          {quizData.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect =
              question.type === "mcq"
                ? userAnswer === question.correctAnswer
                : false;

            return (
              <div
                key={question.id}
                className="mb-6 border rounded-lg p-6 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 flex-1">
                    Question {question.id}: {question.text}
                  </h4>
                  {question.type === "mcq" &&
                    (isCorrect ? (
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                    ) : (
                      <X className="w-6 h-6 text-red-500 flex-shrink-0 ml-4" />
                    ))}
                </div>

                <div className="space-y-3">
                  {userAnswer !== undefined && userAnswer !== "" && (
                    <div
                      className={`p-3 rounded-lg ${
                        question.type === "mcq"
                          ? isCorrect
                            ? "bg-green-50"
                            : "bg-red-50"
                          : "bg-blue-50"
                      }`}
                    >
                      <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                      <p
                        className={`font-medium ${
                          question.type === "mcq"
                            ? isCorrect
                              ? "text-green-800"
                              : "text-red-800"
                            : "text-blue-800"
                        }`}
                      >
                        {question.type === "mcq"
                          ? question.options[userAnswer]
                          : userAnswer}
                      </p>
                    </div>
                  )}

                  {question.type === "mcq" && !isCorrect && (
                    <div className="p-3 rounded-lg bg-teal-50">
                      <p className="text-sm text-gray-600 mb-1">
                        Correct Answer:
                      </p>
                      <p className="font-medium text-teal-800">
                        {question.options[question.correctAnswer]}
                      </p>
                    </div>
                  )}

                  {question.type === "short" && question.shortAnswer && (
                    <div className="p-3 rounded-lg bg-teal-50">
                      <p className="text-sm text-gray-600 mb-1">
                        Expected Answer:
                      </p>
                      <p className="font-medium text-teal-800">
                        {question.shortAnswer}
                      </p>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-sm text-gray-600 mb-1">Explanation:</p>
                    <p className="text-blue-800">
                      {question.hints && question.hints[3]
                        ? question.hints[3]
                        : "No explanation available"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors"
            >
              Download as PDF
              <img
                src={DownloadIcon}
                alt="download icon"
                className="w-5 h-5 object-contain"
              />
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              Return Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-green-100 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Questions</h2>

        <div className="grid grid-cols-4 gap-2 mb-8">
          {quizData.questions.map((_, index) => {
            const answered = answers[index] !== undefined;
            const isCurrent = index === currentQuestion;
            const isFlagged = flaggedQuestions.includes(index);
            const highlightQuestion = matchesFilter(index);

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`
                  w-12 h-12 rounded-lg font-semibold flex items-center justify-center transition-all relative
                  ${
                    isCurrent && activeFilter === "all"
                      ? "bg-teal-700 text-white ring-4 ring-teal-300"
                      : isCurrent && activeFilter !== "all"
                      ? "bg-teal-700 text-white"
                      : answered
                      ? "bg-white text-teal-700 border-2 border-teal-700"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                  }
                  ${
                    highlightQuestion && !isCurrent && activeFilter !== "all"
                      ? "bg-teal-50"
                      : ""
                  }
                  ${
                    !highlightQuestion && activeFilter !== "all"
                      ? "opacity-40"
                      : ""
                  }
                  ${isFlagged ? "ring-2 ring-orange-400" : ""}
                `}
              >
                {index + 1}
                {answered && !isCurrent && !isFlagged && (
                  <div className="absolute -top-1 -right-1 bg-teal-700 rounded-full w-4 h-4 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                {isFlagged && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-4 h-4 flex items-center justify-center">
                    <Flag className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleFilterClick("current")}
            className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
              activeFilter === "current" ? "bg-green-200" : "hover:bg-green-50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded ${
                activeFilter === "current"
                  ? "bg-green-500"
                  : "bg-white border-2 border-teal-700"
              }`}
            ></div>
            <span className="text-sm text-gray-700">Current question</span>
          </button>
          <button
            onClick={() => handleFilterClick("answered")}
            className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
              activeFilter === "answered" ? "bg-green-200" : "hover:bg-green-50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded ${
                activeFilter === "answered"
                  ? "bg-green-500"
                  : "bg-white border-2 border-teal-700"
              }`}
            ></div>
            <span className="text-sm text-gray-700">Answered</span>
          </button>
          <button
            onClick={() => handleFilterClick("unanswered")}
            className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
              activeFilter === "unanswered"
                ? "bg-green-200"
                : "hover:bg-green-50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded ${
                activeFilter === "unanswered"
                  ? "bg-green-500"
                  : "bg-white border-2 border-teal-700"
              }`}
            ></div>
            <span className="text-sm text-gray-700">Unanswered</span>
          </button>
          <button
            onClick={() => handleFilterClick("flagged")}
            className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
              activeFilter === "flagged"
                ? "bg-orange-200"
                : "hover:bg-orange-50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded ${
                activeFilter === "flagged"
                  ? "bg-orange-500"
                  : "bg-white border-2 border-orange-500"
              }`}
            ></div>
            <span className="text-sm text-gray-700">Flagged</span>
            {flaggedCount > 0 && (
              <span className="ml-auto text-xs font-bold bg-orange-500 text-white rounded-full px-2 py-0.5">
                {flaggedCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-teal-700 text-white py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors mb-8"
        >
          Submit Quiz
        </button>

        <div className="mt-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src={headerLogo}
              alt="EMEXA Logo"
              className="w-50 h-50 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {quizData.title}
              </h1>
              <div className="flex items-center gap-2 text-teal-700">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{formatTime(totalTime)}</span>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestion + 1) / quizData.questions.length) * 100
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {currentQuestion + 1} / {quizData.questions.length} Questions
            </p>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-md p-8 relative">
            {showBulb && (
              <button
                onClick={handleBulbClick}
                className="absolute top-6 right-6 animate-bounce"
              >
                <Lightbulb className="w-10 h-10 text-yellow-500 fill-yellow-200" />
              </button>
            )}

            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Question {question.id}
                </h2>
              </div>
              <button
                onClick={() => handleToggleFlag(currentQuestion)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                title={
                  flaggedQuestions.includes(currentQuestion)
                    ? "Unflag this question"
                    : "Flag this question for review"
                }
              >
                <Flag
                  className={`w-5 h-5 transition-colors ${
                    flaggedQuestions.includes(currentQuestion)
                      ? "text-orange-500 fill-orange-500"
                      : "text-gray-400 hover:text-orange-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    flaggedQuestions.includes(currentQuestion)
                      ? "text-orange-600"
                      : "text-gray-600"
                  }`}
                >
                  {flaggedQuestions.includes(currentQuestion)
                    ? "Flagged"
                    : "Flag"}
                </span>
              </button>
            </div>
            <p className="text-lg text-gray-700 mb-8">{question.text}</p>

            {/* Options for MCQ or Text Input for Short Answer */}
            {question.type === "mcq" ? (
              <div className="space-y-4 mb-8">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${
                        answers[currentQuestion] === index
                          ? "border-teal-600 bg-teal-50 ring-2 ring-teal-200"
                          : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${
                          answers[currentQuestion] === index
                            ? "border-teal-600 bg-teal-600"
                            : "border-gray-300"
                        }
                      `}
                      >
                        {answers[currentQuestion] === index && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-8">
                <textarea
                  value={answers[currentQuestion] || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion]: e.target.value,
                    })
                  }
                  placeholder="Type your answer here..."
                  rows="4"
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 resize-none"
                />
              </div>
            )}

            {/* Hints Section */}
            {showHints && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <h3 className="font-semibold text-gray-800">
                    {aiHints[currentQuestion]
                      ? "🤖 AI-Generated Hint"
                      : "Need a hint?"}
                  </h3>
                </div>

                {/* AI Hint (if available) */}
                {aiHints[currentQuestion] ? (
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-400 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold text-blue-700">
                        AI Hint
                      </span>
                      <span className="text-xs text-orange-600 ml-auto">
                        (-1 mark)
                      </span>
                    </div>
                    <p className="text-gray-700">{aiHints[currentQuestion]}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      You have {question.hints.length} hints available. Each
                      hint provides additional information.
                    </p>

                    <div className="space-y-3">
                      {question.hints.map((hint, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-700">
                              Hint {index + 1}
                            </span>
                            {!revealedHints.includes(index) && (
                              <button
                                onClick={() => handleRevealHint(index)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Reveal
                              </button>
                            )}
                          </div>
                          {revealedHints.includes(index) && (
                            <p className="text-gray-700">{hint}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors
                  ${
                    currentQuestion === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentQuestion === quizData.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 transition-colors"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Dialog */}
      {showEmojiDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
              How are you feeling?
            </h3>
            <div className="flex justify-around">
              {[
                { emoji: "😊", label: "Happy", value: "happy" },
                { emoji: "😐", label: "Neutral", value: "neutral" },
                { emoji: "😕", label: "Confused", value: "confused" },
                { emoji: "😤", label: "Frustrated", value: "frustrated" },
                { emoji: "😃", label: "Excited", value: "excited" },
              ].map(({ emoji, label, value }) => (
                <button
                  key={value}
                  onClick={() => handleEmojiClick(value)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-4xl">{emoji}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden webcam video for AI emotion tracking */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
    </div>
  );
};

export default QuizPage;
