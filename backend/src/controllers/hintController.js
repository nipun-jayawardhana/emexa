import { HfInference } from '@huggingface/inference';
import HintUsage from '../models/hintUsage.js';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HF_API_KEY);

// Create an API endpoint that generates a helpful quiz hint using
// Hugging Face text generation model.
// Input: question text, options, previous attempts.
// Output: 1–2 sentence hint.
// Deduct 1 mark per hint.
// Use Hugging Face text generation API.

export const generateHint = async (req, res) => {
  try {
    const { 
      userId, 
      sessionId, 
      questionId, 
      questionIndex,
      questionText, 
      options, 
      previousAttempts = 0 
    } = req.body;

    if (!userId || !sessionId || !questionId || !questionText || !options) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, sessionId, questionId, questionText, options'
      });
    }

    // Check if hint already requested for this question in this session
    const existingHint = await HintUsage.findOne({ 
      userId, 
      sessionId, 
      questionId 
    });

    if (existingHint) {
      return res.status(200).json({
        success: true,
        data: {
          hint: existingHint.hintText,
          deduction: existingHint.deduction,
          alreadyRequested: true
        }
      });
    }

    // Prepare prompt for Hugging Face
    const optionsText = options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n');
    
    const prompt = `You are a helpful tutor. A student is struggling with this quiz question. Provide a brief, encouraging hint (1-2 sentences) that guides them toward the answer without revealing it directly.

Question: ${questionText}

Options:
${optionsText}

Hint:`;

    // Generate hint using Hugging Face text generation
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false
      }
    });

    let hintText = response.generated_text.trim();
    
    // Clean up the hint - remove any extra content after the hint
    const lines = hintText.split('\n').filter(line => line.trim());
    hintText = lines[0] || 'Think about the key concepts related to this topic.';

    // Save hint usage to database
    const hintUsage = new HintUsage({
      userId,
      sessionId,
      questionId,
      questionIndex,
      hintText,
      deduction: 1, // Each hint deducts 1 mark
      timestamp: new Date()
    });

    await hintUsage.save();

    res.status(200).json({
      success: true,
      data: {
        hint: hintText,
        deduction: 1,
        alreadyRequested: false
      }
    });

  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating hint',
      error: error.message
    });
  }
};

// Get total hints used in a session
export const getHintsUsed = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const hints = await HintUsage.find({ sessionId });
    
    const totalDeduction = hints.reduce((sum, hint) => sum + hint.deduction, 0);

    res.status(200).json({
      success: true,
      data: {
        hintsUsed: hints.length,
        totalDeduction,
        hints: hints.map(h => ({
          questionIndex: h.questionIndex,
          hint: h.hintText,
          timestamp: h.timestamp
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching hints:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hints',
      error: error.message
    });
  }
};
