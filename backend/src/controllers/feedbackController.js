import { HfInference } from '@huggingface/inference';
import QuizAttempt from '../models/quizAttempt.js';
import EmotionLog from '../models/emotionLog.js';
import HintUsage from '../models/hintUsage.js';

// Initialize Hugging Face client
const hf = process.env.HF_API_KEY && process.env.HF_API_KEY !== 'hf_dummy_key_for_testing' 
  ? new HfInference(process.env.HF_API_KEY) 
  : null;

// Create an API endpoint that generates personalized quiz feedback
// using Hugging Face text generation.
// Input: raw score, hint count, emotion summary.
// Output: 3–5 sentence personalized feedback paragraph.

export const generateFeedback = async (req, res) => {
  try {
    const {
      userId,
      quizId,
      sessionId,
      rawScore,
      totalQuestions,
      answers
    } = req.body;

    if (!userId || !quizId || !sessionId || rawScore === undefined || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, quizId, sessionId, rawScore, totalQuestions'
      });
    }

    // Get emotion logs
    const emotionLogs = await EmotionLog.find({ userId, sessionId });
    
    // Get hints used
    const hintsUsed = await HintUsage.find({ userId, sessionId });
    
    // Calculate final score
    const totalHints = hintsUsed.length;
    const finalScore = Math.max(0, rawScore - totalHints);
    
    // Calculate emotion summary
    const emotionCounts = {};
    emotionLogs.forEach(log => {
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
    });

    const mostCommonEmotion = emotionLogs.length > 0
      ? Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0][0]
      : 'neutral';

    const confusedCount = emotionCounts['confused'] || 0;
    const happyCount = emotionCounts['happy'] || 0;
    const neutralCount = emotionCounts['neutral'] || 0;

    // Prepare prompt for personalized feedback
    const scorePercentage = Math.round((rawScore / totalQuestions) * 100);
    const emotionSummary = emotionLogs.length > 0
      ? `Student showed ${mostCommonEmotion} emotion most often. Confusion detected ${confusedCount} times.`
      : 'No emotion data available.';

    const prompt = `You are an encouraging teacher providing personalized feedback to a student who just completed a quiz. Write a supportive, constructive 3-5 sentence feedback paragraph.

Student Performance:
- Score: ${rawScore}/${totalQuestions} (${scorePercentage}%)
- Hints Used: ${totalHints}
- Final Score (after hint deduction): ${finalScore}/${totalQuestions}
- Emotional State: ${emotionSummary}

Provide personalized feedback that:
1. Acknowledges their effort and strengths
2. Addresses emotional patterns if confusion was detected
3. Provides specific, actionable advice
4. Encourages continued learning

Feedback:`;

    // Check if HF client is available
    if (!hf) {
      return res.status(503).json({
        success: false,
        message: 'Feedback generation not available - API key not configured'
      });
    }

    // Generate feedback using Hugging Face
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false
      }
    });

    let aiFeedback = response.generated_text.trim();
    
    // Clean up feedback - remove any prompt repetition
    const feedbackLines = aiFeedback.split('\n').filter(line => 
      line.trim() && 
      !line.includes('Student Performance:') &&
      !line.includes('Feedback:')
    );
    aiFeedback = feedbackLines.join(' ').trim();

    // If feedback is too short, provide a default
    if (aiFeedback.length < 50) {
      aiFeedback = `Great effort on completing this quiz! You scored ${rawScore} out of ${totalQuestions}. ${totalHints > 0 ? `You used ${totalHints} hint${totalHints > 1 ? 's' : ''}, which shows you're actively seeking help when needed.` : 'You worked through the questions independently.'} ${confusedCount > 0 ? 'I noticed some challenging moments, but persistence is key to learning.' : 'Your focus was commendable.'} Keep practicing and reviewing the core concepts to strengthen your understanding!`;
    }

    // Save quiz attempt
    const quizAttempt = new QuizAttempt({
      userId,
      quizId,
      sessionId,
      rawScore,
      hintsUsed: totalHints,
      finalScore,
      emotionalSummary: {
        mostCommonEmotion,
        confusedCount,
        happyCount,
        neutralCount,
        totalEmotionCaptures: emotionLogs.length
      },
      aiFeedback,
      answers: answers || [],
      completedAt: new Date()
    });

    await quizAttempt.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        rawScore,
        hintsUsed: totalHints,
        finalScore,
        feedback: aiFeedback,
        emotionalSummary: {
          mostCommonEmotion,
          totalCaptures: emotionLogs.length,
          emotionCounts
        }
      }
    });

  } catch (error) {
    console.error('Feedback generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating feedback',
      error: error.message
    });
  }
};

// Get quiz attempt details
export const getQuizAttempt = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const attempt = await QuizAttempt.findOne({ sessionId })
      .populate('userId', 'name email')
      .populate('quizId', 'title description');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });

  } catch (error) {
    console.error('Error fetching quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz attempt',
      error: error.message
    });
  }
};

// Get all attempts for a user
export const getUserAttempts = async (req, res) => {
  try {
    const { userId } = req.params;

    const attempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title description')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      data: attempts
    });

  } catch (error) {
    console.error('Error fetching user attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user attempts',
      error: error.message
    });
  }
};
