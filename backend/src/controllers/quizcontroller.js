import HintUsage from '../models/hintUsage.js';
import EmotionLog from '../models/emotionLog.js';
import aiService from '../services/aiService.js';

// Sample quiz data (replace with database queries later)
const sampleQuizzes = {
  'matrix-quiz': {
    id: 'matrix-quiz',
    title: 'Matrix Operations',
    description: 'Test your knowledge of matrix operations',
    questions: [
      {
        id: 1,
        text: "What is the result of multiplying a 2x3 matrix by a 3x2 matrix?",
        options: ["2x2 matrix", "3x3 matrix", "2x3 matrix", "Cannot be multiplied"],
        correctAnswer: 0,
        hints: [
          "Think about matrix dimension rules.",
          "When multiplying matrices, the inner dimensions must match.",
          "The result takes the outer dimensions.",
          "A 2x3 × 3x2 results in a 2x2 matrix."
        ]
      },
      // Add more questions...
    ]
  },
  'vectors-quiz': {
    id: 'vectors-quiz',
    title: 'Vector Mathematics',
    description: 'Comprehensive test on vectors',
    questions: [
      // Add vector questions...
    ]
  },
  'limits-quiz': {
    id: 'limits-quiz',
    title: 'Calculus Limits',
    description: 'Understanding limits and continuity',
    questions: [
      // Add limit questions...
    ]
  }
};

// Get all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    // TODO: Replace with database query
    const quizzes = Object.values(sampleQuizzes).map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questions.length
    }));

    res.json({
      success: true,
      quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// Get quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // TODO: Replace with database query
    const quiz = sampleQuizzes[quizId];

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message
    });
  }
};

// Submit quiz answers (ORIGINAL - without AI)
export const submitQuizAnswers = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = req.user.id;

    // TODO: Replace with database query
    const quiz = sampleQuizzes[quizId];

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // TODO: Save results to database
    const quizResult = {
      userId,
      quizId,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeTaken,
      answers: results,
      submittedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: quizResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
};

// Get quiz results
export const getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    // TODO: Fetch from database
    // This is placeholder data
    res.json({
      success: true,
      result: {
        quizId,
        score: 85,
        completedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz results',
      error: error.message
    });
  }
};

// Request AI-generated hint
export const requestHint = async (req, res) => {
  try {
    const { userId, quizId, sessionId, questionIndex, question, options, requestType } = req.body;

    // Validate required fields
    if (!userId || !quizId || !sessionId || questionIndex === undefined || !question || !options) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get recent emotion if available
    let emotionalContext = null;
    try {
      const recentEmotion = await EmotionLog.findOne({
        userId,
        sessionId,
        questionIndex
      }).sort({ timestamp: -1 });

      if (recentEmotion) {
        emotionalContext = recentEmotion.emotion;
      }
    } catch (emotionError) {
      console.log('Could not fetch recent emotion:', emotionError.message);
      // Continue without emotional context
    }

    // Generate hint using AI
    const hintText = await aiService.generateHint(question, options, emotionalContext);

    // Save hint usage
    const hintUsage = new HintUsage({
      userId,
      quizId,
      sessionId,
      questionIndex,
      hintText,
      requestType: requestType || 'manual'
    });

    await hintUsage.save();

    res.json({
      success: true,
      data: {
        hint: hintText,
        penaltyApplied: true,
        penaltyAmount: 1
      }
    });
  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hint',
      error: error.message
    });
  }
};

// Submit quiz with AI feedback
export const submitQuizWithAI = async (req, res) => {
  try {
    const { userId, quizId, sessionId, answers } = req.body;

    // Validate inputs
    if (!userId || !quizId || !sessionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, quizId, sessionId, answers'
      });
    }

    // TODO: Replace with database query
    const quiz = sampleQuizzes[quizId];

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate raw score
    let correctAnswers = 0;
    answers.forEach(answer => {
      const question = quiz.questions[answer.questionIndex];
      if (question && answer.answerIndex === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const rawScore = correctAnswers;
    const totalQuestions = quiz.questions.length;

    // Get hint count
    const hintsUsed = await HintUsage.countDocuments({ userId, sessionId });

    // Calculate final score with penalty
    const finalScore = Math.max(0, rawScore - hintsUsed);

    // Get emotional summary
    const emotions = await EmotionLog.find({ userId, sessionId });
    const emotionalSummary = summarizeEmotions(emotions);

    // Generate personalized feedback using AI
    const feedback = await aiService.generateFeedback({
      score: finalScore,
      totalQuestions,
      hintsUsed,
      emotionalSummary
    });

    // TODO: Save quiz attempt to database
    const quizAttempt = {
      userId,
      quizId,
      sessionId,
      rawScore,
      hintsUsed,
      finalScore,
      emotionalSummary,
      aiFeedback: feedback,
      submittedAt: new Date()
    };

    res.json({
      success: true,
      data: {
        rawScore,
        hintsUsed,
        finalScore,
        totalQuestions,
        percentage: ((finalScore / totalQuestions) * 100).toFixed(1),
        feedback,
        emotionalSummary
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

// HELPER FUNCTION
function summarizeEmotions(emotions) {
  if (!emotions || emotions.length === 0) {
    return 'neutral throughout';
  }

  const emotionCounts = {};
  emotions.forEach(log => {
    emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
  });

  const sorted = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return sorted.map(([emotion]) => emotion).join(', ');
}