// backend/src/services/aiService.js
import axios from 'axios';

class AIService {
  constructor() {
    // Initialize API configurations
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    this.cohereApiKey = process.env.COHERE_API_KEY;
    
    this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.huggingFaceEndpoint = 'https://api-inference.huggingface.co/models/';
    this.cohereEndpoint = 'https://api.cohere.ai/v1/generate';
  }

  /**
   * Generate quiz questions using Gemini API (Primary method)
   */
  async generateQuizWithGemini(subject, gradeLevel, numberOfQuestions, difficultyLevel = 'medium', topics = []) {
    try {
      const prompt = this.buildQuizPrompt(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      
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
          }
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      return this.parseQuizResponse(generatedText);
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate quiz with Gemini API');
    }
  }

  /**
   * Generate quiz questions using Hugging Face (Fallback method)
   */
  async generateQuizWithHuggingFace(subject, gradeLevel, numberOfQuestions, difficultyLevel = 'medium', topics = []) {
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
          }
        }
      );

      const generatedText = response.data[0].generated_text;
      return this.parseQuizResponse(generatedText);
    } catch (error) {
      console.error('Hugging Face API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate quiz with Hugging Face API');
    }
  }

  /**
   * Generate quiz questions using Cohere (Alternative method)
   */
  async generateQuizWithCohere(subject, gradeLevel, numberOfQuestions, difficultyLevel = 'medium', topics = []) {
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
          }
        }
      );

      return this.parseQuizResponse(response.data.generations[0].text);
    } catch (error) {
      console.error('Cohere API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate quiz with Cohere API');
    }
  }

  /**
   * Main method with fallback support
   */
  async generateQuiz(params) {
    const { subject, gradeLevel, numberOfQuestions, difficultyLevel, topics, aiProvider = 'gemini' } = params;

    // Try primary provider first
    try {
      if (aiProvider === 'gemini' && this.geminiApiKey) {
        return await this.generateQuizWithGemini(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      } else if (aiProvider === 'huggingface' && this.huggingFaceApiKey) {
        return await this.generateQuizWithHuggingFace(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      } else if (aiProvider === 'cohere' && this.cohereApiKey) {
        return await this.generateQuizWithCohere(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
      }
    } catch (error) {
      console.error(`Primary AI provider (${aiProvider}) failed, trying fallback...`);
    }

    // Fallback chain
    const providers = ['gemini', 'huggingface', 'cohere'];
    for (const provider of providers) {
      if (provider === aiProvider) continue;
      
      try {
        if (provider === 'gemini' && this.geminiApiKey) {
          return await this.generateQuizWithGemini(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
        } else if (provider === 'huggingface' && this.huggingFaceApiKey) {
          return await this.generateQuizWithHuggingFace(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
        } else if (provider === 'cohere' && this.cohereApiKey) {
          return await this.generateQuizWithCohere(subject, gradeLevel, numberOfQuestions, difficultyLevel, topics);
        }
      } catch (error) {
        console.error(`Fallback provider (${provider}) failed:`, error.message);
      }
    }

    throw new Error('All AI providers failed to generate quiz');
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
    const questions = [];
    const questionBlocks = responseText.split(/QUESTION \d+:/i).filter(block => block.trim());

    for (const block of questionBlocks) {
      try {
        const lines = block.trim().split('\n').filter(line => line.trim());
        
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
        if (correctAnswer) {
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
        }
      } catch (error) {
        console.error('Error parsing question block:', error);
      }
    }

    if (questions.length === 0) {
      throw new Error('Failed to parse any valid questions from AI response');
    }

    return questions;
  }

  /**
   * Enhance existing questions with AI suggestions
   */
  async enhanceQuestion(questionData) {
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
          headers: { 'Content-Type': 'application/json' }
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