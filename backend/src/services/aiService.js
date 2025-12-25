// backend/src/services/aiService.js
import axios from 'axios';

class AIService {
  constructor() {
    this.initialized = false;
    this.geminiApiKey = null;
    this.huggingFaceApiKey = null;
    this.cohereApiKey = null;
  }

  /**
   * Initialize API configurations (called on first use)
   */
  initialize() {
    if (this.initialized) return;

    // Initialize API configurations
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    this.cohereApiKey = process.env.COHERE_API_KEY;
    
    // Using Gemini 2.5 Flash - the latest available model
    this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
    this.huggingFaceEndpoint = 'https://api-inference.huggingface.co/models/';
    this.cohereEndpoint = 'https://api.cohere.ai/v1/generate';

    console.log('🤖 AI Service initialized');
    console.log('   Gemini API Key:', this.geminiApiKey ? '✅ Present' : '❌ Missing');
    console.log('   HuggingFace API Key:', this.huggingFaceApiKey ? '✅ Present' : '❌ Missing');
    console.log('   Cohere API Key:', this.cohereApiKey ? '✅ Present' : '❌ Missing');
    
    this.initialized = true;
  }

  /**
   * Generate quiz questions using Gemini API (Primary method)
   */
  async generateQuizWithGemini(subject, gradeLevel, numberOfQuestions, difficultyLevel = 'medium', topics = []) {
    this.initialize(); // Ensure initialization
    
    console.log('🔮 Attempting Gemini API...');
    
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = this.buildQuizPrompt(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      
      console.log('📤 Sending request to Gemini API...');
      console.log('   URL:', `${this.geminiEndpoint}?key=${this.geminiApiKey.substring(0, 10)}...`);
      
      const response = await axios.post(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('✅ Gemini API response received');
      
      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('❌ Invalid Gemini response structure:', JSON.stringify(response.data, null, 2));
        throw new Error('Invalid response structure from Gemini API');
      }

      const generatedText = response.data.candidates[0].content.parts[0].text;
      console.log('📝 Generated text length:', generatedText.length);
      
      const parsedQuestions = this.parseQuizResponse(generatedText);
      console.log('✅ Successfully parsed', parsedQuestions.length, 'questions');
      
      return parsedQuestions;
    } catch (error) {
      console.error('❌ Gemini API Error Details:');
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('   Error Message:', error.message);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request to Gemini API - check API key or request format');
      } else if (error.response?.status === 403) {
        throw new Error('Gemini API key is invalid or access denied');
      } else if (error.response?.status === 429) {
        throw new Error('Gemini API rate limit exceeded - please try again later');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request to Gemini API timed out');
      }
      
      throw new Error(`Gemini API failed: ${error.message}`);
    }
  }

  /**
   * Generate quiz questions using Hugging Face (Fallback method)
   */
  async generateQuizWithHuggingFace(subject, gradeLevel, numberOfQuestions, difficultyLevel = 'medium', topics = []) {
    this.initialize(); // Ensure initialization
    
    console.log('🤗 Attempting Hugging Face API...');
    
    if (!this.huggingFaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      const prompt = this.buildQuizPrompt(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      const model = 'mistralai/Mistral-7B-Instruct-v0.2';

      const response = await axios.post(
        `${this.huggingFaceEndpoint}${model}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 2000,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout for HF (slower)
        }
      );

      const generatedText = response.data[0].generated_text;
      return this.parseQuizResponse(generatedText);
    } catch (error) {
      console.error('❌ Hugging Face API Error:', error.response?.data || error.message);
      throw new Error(`Hugging Face API failed: ${error.message}`);
    }
  }

  /**
   * Generate quiz questions using Cohere (Alternative method)
   */
  async generateQuizWithCohere(subject, gradeLevel, numberOfQuestions, difficultyLevel = 'medium', topics = []) {
    this.initialize(); // Ensure initialization
    
    console.log('🔮 Attempting Cohere API...');
    
    if (!this.cohereApiKey) {
      throw new Error('Cohere API key not configured');
    }

    try {
      const prompt = this.buildQuizPrompt(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);

      const response = await axios.post(
        this.cohereEndpoint,
        {
          model: 'command',
          prompt: prompt,
          max_tokens: 2000,
          temperature: 0.7,
          k: 0,
          stop_sequences: [],
          return_likelihoods: 'NONE'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.cohereApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return this.parseQuizResponse(response.data.generations[0].text);
    } catch (error) {
      console.error('❌ Cohere API Error:', error.response?.data || error.message);
      throw new Error(`Cohere API failed: ${error.message}`);
    }
  }

  /**
   * Main method with fallback support
   */
  async generateQuiz(params) {
    this.initialize(); // Ensure initialization
    
    const { subject, gradeLevel, numberOfQuestions, difficultyLevel, topics, aiProvider = 'gemini' } = params;

    console.log('\n🚀 Starting AI Quiz Generation');
    console.log('   Provider:', aiProvider);
    console.log('   Subject:', subject);
    console.log('   Grade:', gradeLevel);
    console.log('   Questions:', numberOfQuestions);

    const errors = [];

    // Try primary provider first
    try {
      if (aiProvider === 'gemini' && this.geminiApiKey) {
        console.log('📍 Trying primary provider: Gemini');
        return await this.generateQuizWithGemini(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      } else if (aiProvider === 'huggingface' && this.huggingFaceApiKey) {
        console.log('📍 Trying primary provider: Hugging Face');
        return await this.generateQuizWithHuggingFace(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      } else if (aiProvider === 'cohere' && this.cohereApiKey) {
        console.log('📍 Trying primary provider: Cohere');
        return await this.generateQuizWithCohere(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      } else {
        errors.push(`Primary provider ${aiProvider} not configured`);
        console.log(`⚠️ Primary provider (${aiProvider}) not configured`);
      }
    } catch (error) {
      errors.push(`${aiProvider}: ${error.message}`);
      console.error(`❌ Primary AI provider (${aiProvider}) failed:`, error.message);
    }

    // Fallback chain
    console.log('🔄 Trying fallback providers...');
    const providers = [
      { name: 'gemini', key: this.geminiApiKey, method: this.generateQuizWithGemini.bind(this) },
      { name: 'huggingface', key: this.huggingFaceApiKey, method: this.generateQuizWithHuggingFace.bind(this) },
      { name: 'cohere', key: this.cohereApiKey, method: this.generateQuizWithCohere.bind(this) }
    ];

    for (const provider of providers) {
      if (provider.name === aiProvider) continue; // Skip already tried primary
      
      if (!provider.key) {
        console.log(`⏭️ Skipping ${provider.name} (not configured)`);
        continue;
      }

      try {
        console.log(`📍 Trying fallback: ${provider.name}`);
        return await provider.method(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      } catch (error) {
        errors.push(`${provider.name}: ${error.message}`);
        console.error(`❌ Fallback provider (${provider.name}) failed:`, error.message);
      }
    }

    console.error('\n❌ ALL PROVIDERS FAILED:');
    errors.forEach((err, i) => console.error(`   ${i + 1}. ${err}`));
    
    throw new Error(`All AI providers failed to generate quiz:\n${errors.join('\n')}`);
  }

  /**
   * Build comprehensive prompt for quiz generation
   */
  buildQuizPrompt(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics) {
    const topicsText = topics && topics.length > 0 ? `focusing on: ${topics.join(', ')}` : '';
    
    return `You are an expert educational content creator. Generate ${numberOfQuestions} multiple-choice quiz questions for ${gradeLevel} students studying ${subject} ${topicsText}.

Requirements:
- Difficulty level: ${difficultyLevel}
- Each question must have exactly 4 options (A, B, C, D)
- Mark the correct answer clearly
- Include a brief explanation for each correct answer
- Questions should be age-appropriate and curriculum-aligned
- Avoid ambiguous or trick questions
- Ensure educational value and accuracy

Format your response EXACTLY as follows (this is critical):

QUESTION 1: [Write the question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A/B/C/D]
EXPLANATION: [Brief explanation]
HINT: [Optional helpful hint]

QUESTION 2: [Write the question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A/B/C/D]
EXPLANATION: [Brief explanation]
HINT: [Optional helpful hint]

[Continue for all ${numberOfQuestions} questions]

Important: Follow this exact format without any additional text or markdown formatting.`;
  }

  /**
   * Parse AI response into structured quiz data
   */
  parseQuizResponse(responseText) {
    console.log('🔍 Parsing AI response...');
    console.log('   Response text preview:', responseText.substring(0, 200));
    
    const questions = [];
    
    // Clean up the response text - remove markdown code blocks if present
    let cleanedText = responseText
      .replace(/```[\w]*\n/g, '') // Remove opening code blocks
      .replace(/```/g, '')         // Remove closing code blocks
      .trim();
    
    const questionBlocks = cleanedText.split(/QUESTION \d+:/i).filter(block => block.trim());
    
    console.log('   Found', questionBlocks.length, 'question blocks');

    for (let i = 0; i < questionBlocks.length; i++) {
      try {
        const block = questionBlocks[i];
        const lines = block.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) continue;
        
        const questionText = lines[0].trim();
        
        const options = [];
        const optionRegex = /^([A-D])\)\s*(.+)$/i;
        
        for (const line of lines) {
          const match = line.match(optionRegex);
          if (match) {
            options.push({
              id: options.length + 1,
              text: match[2].trim(),
              isCorrect: false
            });
          }
        }

        const correctLine = lines.find(line => line.match(/^CORRECT:/i));
        const correctAnswer = correctLine ? correctLine.replace(/^CORRECT:/i, '').trim().toUpperCase().charAt(0) : null;

        // Mark correct answer
        if (correctAnswer && correctAnswer.match(/[A-D]/)) {
          const correctIndex = correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          if (options[correctIndex]) {
            options[correctIndex].isCorrect = true;
          }
        }

        const explanationLine = lines.find(line => line.match(/^EXPLANATION:/i));
        const explanation = explanationLine ? explanationLine.replace(/^EXPLANATION:/i, '').trim() : '';

        const hintLine = lines.find(line => line.match(/^HINT:/i));
        const hint = hintLine ? hintLine.replace(/^HINT:/i, '').trim() : '';

        if (questionText && options.length === 4 && correctAnswer) {
          questions.push({
            type: 'mcq',
            questionText,
            options,
            hints: [hint || 'Think carefully about the key concepts in this question.', '', '', ''],
            explanation
          });
          console.log(`   ✅ Successfully parsed question ${i + 1}`);
        } else {
          console.warn(`   ⚠️ Skipping incomplete question ${i + 1}:`, {
            hasQuestionText: !!questionText,
            optionsCount: options.length,
            hasCorrectAnswer: !!correctAnswer
          });
        }
      } catch (error) {
        console.error(`   ❌ Error parsing question block ${i + 1}:`, error.message);
      }
    }

    if (questions.length === 0) {
      console.error('❌ Failed to parse any valid questions');
      console.error('   Response text:', responseText);
      throw new Error('Failed to parse any valid questions from AI response');
    }

    console.log(`✅ Successfully parsed ${questions.length} questions`);
    return questions;
  }

  /**
   * Enhance existing questions with AI suggestions
   */
  async enhanceQuestion(questionData) {
    this.initialize(); // Ensure initialization
    
    try {
      const prompt = `Improve this quiz question to make it clearer and more educational:

Question: ${questionData.questionText}
Options: ${questionData.options.map(opt => `${String.fromCharCode(65 + opt.id - 1)}) ${opt.text}`).join('\n')}

Provide:
1. An improved version of the question (if needed)
2. Better hint for students
3. Detailed explanation of the correct answer

Format:
IMPROVED_QUESTION: [question]
HINT: [hint]
EXPLANATION: [explanation]`;

      const response = await axios.post(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const result = response.data.candidates[0].content.parts[0].text;
      
      const improvedQuestion = result.match(/IMPROVED_QUESTION:\s*(.+?)(?=HINT:)/s)?.[1]?.trim();
      const hint = result.match(/HINT:\s*(.+?)(?=EXPLANATION:)/s)?.[1]?.trim();
      const explanation = result.match(/EXPLANATION:\s*(.+?)$/s)?.[1]?.trim();

      return {
        improvedQuestion: improvedQuestion || questionData.questionText,
        hint: hint || questionData.hints?.[0] || '',
        explanation: explanation || ''
      };
    } catch (error) {
      console.error('Error enhancing question:', error);
      throw new Error('Failed to enhance question');
    }
  }
}

export default new AIService();