// backend/src/services/aiService.js
import axios from 'axios';

class AIService {
  constructor() {
    this.initialized = false;
    this.openRouterApiKey = null;
    this.endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'google/gemma-3-12b-it:free';
  }

  _ensureInitialized() {
    if (this.initialized) return;

    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!this.openRouterApiKey) {
      console.error('❌ CRITICAL: OPENROUTER_API_KEY not found in environment variables!');
      throw new Error('OpenRouter API key not configured');
    }

    console.log('🤖 AI Service initialized (OpenRouter - Free)');
    console.log('   Model:', this.model);
    this.initialized = true;
  }

  async generateQuizWithOpenRouter(subject, gradeLevel, numberOfQuestions, difficultyLevel = 'medium', topics = []) {
    this._ensureInitialized();
    console.log('🔮 Attempting OpenRouter API (Free)...');

    try {
      const prompt = this.buildQuizPrompt(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      console.log('📤 Sending request to OpenRouter API...');

      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Emexa Quiz Generator'
          },
          timeout: 60000
        }
      );

      console.log('✅ OpenRouter API response received');

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from OpenRouter API');
      }

      const generatedText = response.data.choices[0].message.content;
      console.log('📝 Generated text length:', generatedText.length);

      const parsedQuestions = this.parseQuizResponse(generatedText);
      console.log('✅ Successfully parsed', parsedQuestions.length, 'questions');
      return parsedQuestions;

    } catch (error) {
      console.error('❌ OpenRouter API Error:', error.response?.status, error.message);

      if (error.response?.status === 401) throw new Error('OpenRouter API key is invalid');
      if (error.response?.status === 429) {
  console.log('⏳ Rate limited on primary model, switching to fallback...');
  const originalModel = this.model;
  this.model = 'meta-llama/llama-3.3-70b-instruct:free';
  try {
    const result = await this.generateQuizWithOpenRouter(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
    this.model = originalModel;
    return result;
  } catch (retryError) {
    this.model = originalModel;
    throw new Error('OpenRouter rate limit exceeded - please try again in a moment');
  }
}
      if (error.code === 'ECONNABORTED') throw new Error('Request timed out');

      throw new Error(`OpenRouter API failed: ${error.message}`);
    }
  }

  async generateQuiz(params) {
    this._ensureInitialized();
    const { subject, gradeLevel, numberOfQuestions, difficultyLevel, topics } = params;

    console.log('\n🚀 Starting AI Quiz Generation (OpenRouter Free)');
    console.log('   Subject:', subject);
    console.log('   Grade:', gradeLevel);
    console.log('   Questions:', numberOfQuestions);

    try {
      return await this.generateQuizWithOpenRouter(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
    } catch (error) {
      console.error('❌ Quiz generation failed:', error.message);
      throw error;
    }
  }

  buildQuizPrompt(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics) {
    const topicsText = topics && topics.length > 0 ? `focusing on: ${topics.join(', ')}` : '';

    return `You are an expert educational content creator. Generate ${numberOfQuestions} multiple-choice quiz questions for ${gradeLevel} students studying ${subject} ${topicsText}.

Requirements:
- Difficulty level: ${difficultyLevel}
- Each question must have exactly 4 options (A, B, C, D)
- Mark the correct answer clearly
- Include a brief explanation for each correct answer
- Questions should be age-appropriate and curriculum-aligned

Format your response EXACTLY as follows:

QUESTION 1: [Write the question here]
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

  parseQuizResponse(responseText) {
    console.log('🔍 Parsing AI response...');
    const questions = [];

    let cleanedText = responseText
      .replace(/```[\w]*\n/g, '')
      .replace(/```/g, '')
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
            options.push({ id: options.length + 1, text: match[2].trim(), isCorrect: false });
          }
        }

        const correctLine = lines.find(line => line.match(/^CORRECT:/i));
        const correctAnswer = correctLine
          ? correctLine.replace(/^CORRECT:/i, '').trim().toUpperCase().charAt(0)
          : null;

        if (correctAnswer && correctAnswer.match(/[A-D]/)) {
          const correctIndex = correctAnswer.charCodeAt(0) - 65;
          if (options[correctIndex]) options[correctIndex].isCorrect = true;
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
            hints: [hint || 'Think carefully about the key concepts.', '', '', ''],
            explanation
          });
          console.log(`   ✅ Parsed question ${i + 1}`);
        }
      } catch (error) {
        console.error(`   ❌ Error parsing question ${i + 1}:`, error.message);
      }
    }

    if (questions.length === 0) throw new Error('Failed to parse any valid questions from AI response');

    console.log(`✅ Successfully parsed ${questions.length} questions`);
    return questions;
  }

  async enhanceQuestion(questionData) {
    this._ensureInitialized();
    try {
      const prompt = `Improve this quiz question:
Question: ${questionData.questionText}
Options: ${questionData.options.map(opt => `${String.fromCharCode(65 + opt.id - 1)}) ${opt.text}`).join('\n')}

Provide:
IMPROVED_QUESTION: [question]
HINT: [hint]
EXPLANATION: [explanation]`;

      const response = await axios.post(
        this.endpoint,
        { model: this.model, messages: [{ role: 'user', content: prompt }], max_tokens: 1000 },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Emexa Quiz Generator'
          },
          timeout: 30000
        }
      );

      const result = response.data.choices[0].message.content;
      return {
        improvedQuestion: result.match(/IMPROVED_QUESTION:\s*(.+?)(?=HINT:)/s)?.[1]?.trim() || questionData.questionText,
        hint: result.match(/HINT:\s*(.+?)(?=EXPLANATION:)/s)?.[1]?.trim() || questionData.hints?.[0] || '',
        explanation: result.match(/EXPLANATION:\s*(.+?)$/s)?.[1]?.trim() || ''
      };
    } catch (error) {
      console.error('Error enhancing question:', error);
      throw new Error('Failed to enhance question');
    }
  }

  async getGenerationSuggestions(subject, gradeLevel) {
    return {
      recommendedQuestions: 5,
      topicSuggestions: [
        'Introduction to ' + subject,
        'Basic concepts',
        'Advanced topics',
        'Real-world applications'
      ]
    };
  }
}

export default new AIService();