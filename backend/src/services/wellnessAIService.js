// backend/src/services/wellnessAIService.js
import axios from 'axios';

class WellnessAIService {
  constructor() {
    this.initialized = false;
    this.openRouterApiKey = null;
    this.endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'google/gemma-3-12b-it:free'; // Great for conversational/wellness
  }

  _ensureInitialized() {
    if (this.initialized) return;

    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!this.openRouterApiKey) {
      console.error('❌ CRITICAL: OPENROUTER_API_KEY not found in environment variables!');
      throw new Error('OpenRouter API key not configured');
    }

    console.log('✅ Wellness AI Service initialized with OpenRouter (FREE!)');
    console.log('🧘 Using model:', this.model);
    this.initialized = true;
  }

  async _callOpenRouter(messages, maxTokens = 200, temperature = 0.7) {
    const response = await axios.post(
      this.endpoint,
      {
        model: this.model,
        messages,
        max_tokens: maxTokens,
        temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Emexa Wellness AI'
        },
        timeout: 30000
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenRouter API');
    }

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Generate personalized wellness advice based on mood
   */
  async generateMoodAdvice(moodData) {
    this._ensureInitialized();

    const { mood, emoji, userName, recentMoods = [] } = moodData;

    try {
      const prompt = this._buildMoodAdvicePrompt(mood, emoji, userName, recentMoods);
      console.log('🧠 Generating personalized wellness advice...');

      const advice = await this._callOpenRouter([
        { role: 'user', content: prompt }
      ], 200, 0.7);

      console.log('✅ Generated personalized advice');

      return {
        success: true,
        advice: advice || this._getFallbackAdvice(mood),
        mood,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error generating wellness advice:', error.message);

      return {
        success: false,
        advice: this._getFallbackAdvice(mood),
        mood,
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate daily wellness tip
   */
  async generateDailyTip(userContext = {}) {
    this._ensureInitialized();

    try {
      const prompt = `You are a wellness coach. Generate ONE short wellness tip for students in 1-2 sentences. Focus on: ${userContext.recentActivity || 'study-life balance'}.`;

      const tip = await this._callOpenRouter([
        { role: 'user', content: prompt }
      ], 100, 0.8);

      return {
        success: true,
        tip: tip || "Take regular breaks and stay hydrated. Your wellbeing matters!",
        date: new Date().toDateString()
      };

    } catch (error) {
      console.error('❌ Error generating daily tip:', error.message);

      return {
        success: false,
        tip: "Remember to take breaks and celebrate small victories. You're doing great!",
        date: new Date().toDateString()
      };
    }
  }

  /**
   * Analyze mood patterns
   */
  async analyzeMoodPatterns(moodHistory) {
    this._ensureInitialized();

    if (!moodHistory || moodHistory.length < 3) {
      return {
        success: false,
        message: 'Not enough data for pattern analysis'
      };
    }

    try {
      const moodSummary = moodHistory.slice(-7).map(m =>
        `${m.date}: ${m.mood}`
      ).join(', ');

      const prompt = `Analyze this student's mood pattern: ${moodSummary}. Provide a brief, caring observation (2-3 sentences) and one suggestion. Be warm and supportive.`;

      const insights = await this._callOpenRouter([
        { role: 'user', content: prompt }
      ], 150, 0.6);

      return {
        success: true,
        insights: insights || "You're doing great by tracking your moods! Keep it up.",
        moodCount: moodHistory.length
      };

    } catch (error) {
      console.error('❌ Error analyzing mood patterns:', error.message);

      return {
        success: false,
        insights: "Keep tracking your moods to help us understand your patterns better!",
        moodCount: moodHistory.length
      };
    }
  }

  /**
   * Chatbot conversation
   */
  async generateChatResponse(messageData) {
    this._ensureInitialized();

    const { message, history = [], userName } = messageData;

    try {
      const systemPrompt = `You are a compassionate wellness coach for students. Respond in 2-4 sentences. Be supportive, practical, and warm. The student's name is ${userName || 'Student'}.`;

const messages = [
  {
    role: 'user',
    content: systemPrompt + '\n\n' + message
  }
];

      // Add conversation history (last 4 messages for context)
      history.slice(-4).forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      // Add current message
      messages.push({ role: 'user', content: message });

      console.log('💬 Generating chatbot response...');

      const chatResponse = await this._callOpenRouter(messages, 200, 0.7);

      console.log('✅ Generated chatbot response');

      return {
        success: true,
        response: chatResponse || "I'm here to support you. Can you tell me more about what you're experiencing?",
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error generating chat response:', error.message);

      const fallbackResponses = [
        "I understand how you're feeling. Let's work through this together.",
        "Thank you for sharing. Your feelings are valid. How can I help?",
        "I'm here to support you. What would help you most right now?",
        "That's a great observation. What small step could you take today?",
        "Remember, taking care of your mental health is important."
      ];

      return {
        success: false,
        response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date()
      };
    }
  }

  _buildMoodAdvicePrompt(mood, emoji, userName, recentMoods) {
    const moodContext = recentMoods.length > 0
      ? `Recent moods: ${recentMoods.slice(-3).join(', ')}`
      : 'First mood entry';

    return `You are a wellness coach. Student ${userName || 'Student'} is feeling ${mood} ${emoji}. ${moodContext}. Respond with empathy in 2-3 sentences: acknowledge feelings, give ONE actionable tip, end with encouragement.`;
  }

  _getFallbackAdvice(mood) {
    const fallbackAdvice = {
      'Very Sad': "I'm here with you. Your feelings are valid. Try some deep breaths and reach out to someone you trust.",
      'Sad': "It's okay to feel down. Be gentle with yourself today. Small steps are still progress.",
      'Neutral': "You're doing fine! Some days are just steady. Keep taking care of yourself.",
      'Happy': "Great to see you feeling good! Keep that positive energy going.",
      'Very Happy': "Wonderful! Celebrate these good moments. You're doing amazing!"
    };

    return fallbackAdvice[mood] || "Take care of yourself. You're important!";
  }
}

export default new WellnessAIService();