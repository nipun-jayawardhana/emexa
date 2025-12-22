import HintUsage from '../models/hintUsage.js';
import { getHfClient } from '../utils/hfClient.js';

// Initialize Hugging Face client - lazy initialization to ensure env is loaded

// Create an API endpoint that generates a helpful quiz hint using
// Hugging Face text generation model.
// Input: question text, options, previous attempts.
// Output: 1–2 sentence hint.
// Deduct 1 mark per hint.
// Use Hugging Face text generation API.

export const generateHint = async (req, res) => {
  try {
    console.log('📝 Hint request received');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    
    const { 
      sessionId, 
      questionId, 
      questionIndex,
      questionText, 
      options, 
      previousAttempts = 0 
    } = req.body;

    // Get userId from authenticated user or request body
    const userId = req.user?.id || req.body.userId;
    console.log('✅ Using userId:', userId);

    if (!userId || !sessionId || !questionId || !questionText || !options) {
      console.error('❌ Missing fields:', {
        userId: !!userId,
        sessionId: !!sessionId,
        questionId: !!questionId,
        questionText: !!questionText,
        options: !!options
      });
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
      // Parse stored hints (separated by |)
      const storedHints = existingHint.hintText.split(' | ').filter(h => h.trim());
      console.log('📦 Returning cached hints:', storedHints);
      console.log('📦 Cached hints count:', storedHints.length);
      
      return res.status(200).json({
        success: true,
        data: {
          hints: storedHints.length > 0 ? storedHints : [existingHint.hintText], // Always return array
          deduction: existingHint.deduction,
          alreadyRequested: true
        }
      });
    }

    // Check if HF_API_KEY is available
    const hfClient = getHfClient();
    if (!hfClient) {
      return res.status(503).json({
        success: false,
        message: 'AI hint generation is currently unavailable. Please try again later.'
      });
    }

    // Prepare prompt for Hugging Face
    const optionsText = options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n');
    
    // Create instruction-based prompt for Qwen model to generate 4 hints
    const userMessage = `You are a helpful tutor. Provide exactly 4 progressive hints for this quiz question. Each hint should be on a new line, numbered 1-4. Start with general guidance and progressively give more specific clues without revealing the answer directly.

Question: ${questionText}

Options:
${optionsText}

Please provide 4 helpful hints (one per line, numbered):`;

    // Generate hints using Qwen chat model (conversational)
    console.log('🤖 Calling Hugging Face API for hint generation...');
    console.log('📝 Prompt:', userMessage.substring(0, 200) + '...');
    
    const response = await hfClient.chatCompletion({
      model: 'Qwen/Qwen3-4B-Instruct-2507',
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 250,
      temperature: 0.7
    });

    console.log('✅ HF API raw response:', response);

    const generatedText = response?.choices?.[0]?.message?.content;

    if (!generatedText || typeof generatedText !== 'string') {
      console.error('⚠️ Hugging Face response missing content:', response);
      throw new Error('AI service returned an empty response');
    }

    let hintText = generatedText.trim();
    console.log('📄 Generated hint text:', hintText);
    
    // Parse the hints - try to extract 4 numbered hints
    const lines = hintText.split('\n').filter(line => line.trim());
    const hints = [];
    
    // Extract numbered hints (1., 2., 3., 4. or 1: 2: etc)
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Match patterns like "1.", "1:", "1 -", "Hint 1:", etc
      if (/^(\d+[\.\:\-\)]|\*\*?\d+|\d+\s*[-\.]|Hint\s*\d+[\:\.]?)\s*(.+)/.test(trimmedLine)) {
        const hintContent = trimmedLine.replace(/^(\d+[\.\:\-\)]|\*\*?\d+|\d+\s*[-\.]|Hint\s*\d+[\:\.]?)\s*/, '').trim();
        if (hintContent) {
          hints.push(hintContent);
        }
      }
    }
    
    // If we didn't get 4 hints, use the first 4 lines or pad with defaults
    if (hints.length < 4) {
      const defaultHints = [
        'Think carefully about the key concepts in the question.',
        'Consider what makes each option different from the others.',
        'Focus on the main idea being tested.',
        'Review the fundamental principles related to this topic.'
      ];
      
      while (hints.length < 4) {
        hints.push(defaultHints[hints.length] || 'Think about what you already know about this topic.');
      }
    }
    
    // Take only first 4 hints
    const finalHints = hints.slice(0, 4);
    console.log('📄 Parsed 4 hints:', finalHints);
    console.log('📄 Hints count:', finalHints.length);

    // Save hint usage to database with all 4 hints
    console.log('💾 Saving hint usage to database...');
    const hintUsage = new HintUsage({
      userId,
      sessionId,
      questionId,
      questionIndex,
      hintText: finalHints.join(' | '), // Store all hints separated by |
      deduction: 1, // Each hint deducts 1 mark
      timestamp: new Date()
    });

    console.log('📦 HintUsage object:', hintUsage);
    await hintUsage.save();
    console.log('✅ Hint saved successfully');

    console.log('📤 Returning response with hints:', finalHints);
    res.status(200).json({
      success: true,
      data: {
        hints: finalHints, // Return array of 4 hints
        deduction: 1,
        alreadyRequested: false
      }
    });
    console.log('✅ Hint response sent to client');

  } catch (error) {
    console.error('💥 Hint generation error:', error);
    console.error('📋 Error stack:', error.stack);
    console.error('📋 Error message:', error.message);
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
