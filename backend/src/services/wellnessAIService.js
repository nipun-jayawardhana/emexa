// backend/src/services/wellnessAIService.js
import axios from 'axios';

class WellnessAIService {
  constructor() {
    this.geminiApiKey = null;
    this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
    this.initialized = false;
  }

  _ensureInitialized() {
    if (this.initialized) return;
    
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!this.geminiApiKey) {
      console.error('❌ Gemini API key not configured for Wellness AI');
      throw new Error('Wellness AI not configured');
    }
    
    console.log('🧘 Wellness AI Service initialized');
    this.initialized = true;
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

      const response = await axios.post(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from AI');
      }

      const advice = response.data.candidates[0].content.parts[0].text;
      console.log('✅ Generated personalized advice');

      return {
        success: true,
        advice: advice.trim(),
        mood,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error generating wellness advice:', error.message);
      
      // Fallback to default advice
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
      const prompt = `You are a compassionate wellness coach for students. Generate ONE inspiring, practical wellness tip for today.

Context: ${userContext.recentActivity || 'Student is working on their studies'}

Requirements:
- Keep it to 1-2 sentences
- Be positive and encouraging
- Make it actionable and practical
- Focus on mental health, study-life balance, or self-care
- Don't use quotes or formatting, just plain text

Generate the tip:`;

      const response = await axios.post(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 150
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const tip = response.data.candidates[0].content.parts[0].text.trim();
      
      return {
        success: true,
        tip,
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
   * Analyze mood patterns and generate insights
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
        `${m.date}: ${m.mood} ${m.emoji}`
      ).join('\n');

      const prompt = `You are a mental health awareness assistant for students. Analyze this mood pattern from the past week and provide supportive insights.

Mood History:
${moodSummary}

Provide:
1. A brief, caring observation about their emotional pattern (2-3 sentences)
2. One practical suggestion to maintain or improve their wellbeing (1-2 sentences)

Keep your response warm, non-judgmental, and under 100 words total. Don't use bullet points or formatting.`;

      const response = await axios.post(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      const insights = response.data.candidates[0].content.parts[0].text.trim();

      return {
        success: true,
        insights,
        moodCount: moodHistory.length
      };

    } catch (error) {
      console.error('❌ Error analyzing mood patterns:', error.message);
      
      return {
        success: false,
        insights: "Keep tracking your moods to help us understand your patterns better. You're taking great steps for your wellbeing!",
        moodCount: moodHistory.length
      };
    }
  }

  /**
   * Build prompt for mood-based advice
   */
  _buildMoodAdvicePrompt(mood, emoji, userName, recentMoods) {
    const moodContext = recentMoods.length > 0 
      ? `Recent mood history: ${recentMoods.slice(-3).join(', ')}`
      : 'First mood entry';

    return `You are a compassionate, supportive wellness coach for students. A student named ${userName || 'Student'} just shared they're feeling ${mood} ${emoji}.

${moodContext}

Provide warm, personalized advice in 2-3 short sentences that:
- Acknowledges their feelings with empathy
- Offers ONE specific, actionable wellness suggestion
- Ends with gentle encouragement

Keep it conversational, supportive, and under 80 words. Don't use bullet points or formatting.`;
  }

  /**
   * Fallback advice when AI fails
   */
  _getFallbackAdvice(mood) {
    const fallbackAdvice = {
      'Very Sad': "I'm here with you. Remember that difficult feelings pass, and it's brave to acknowledge them. Try taking a few deep breaths, and consider reaching out to someone you trust.",
      'Sad': "It's okay to feel down sometimes. Be gentle with yourself today. Maybe try doing something small that usually brings you comfort, or talk to a friend.",
      'Neutral': "You're doing okay, and that's perfectly fine! Some days are just steady, and that's part of life's balance. Keep taking care of yourself.",
      'Happy': "I'm glad you're feeling good today! Keep this positive energy going, and maybe share a smile with someone else.",
      'Very Happy': "Your positive energy is wonderful! Celebrate these good moments and remember this feeling. You're doing amazing!"
    };

    return fallbackAdvice[mood] || "Remember to take care of yourself. You're important and your wellbeing matters.";
  }
}

export default new WellnessAIService();