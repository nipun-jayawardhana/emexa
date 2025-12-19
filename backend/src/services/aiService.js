import axios from 'axios';

class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.textModelUrl = process.env.TEXT_MODEL_URL || 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';
    
    // Use a PROVEN WORKING emotion model
    this.emotionModelUrl = 'https://api-inference.huggingface.co/models/Xenova/facial_emotions_image_detection';
    
    console.log('🤖 AI Service initialized');
    console.log('🔑 API Key configured:', !!this.apiKey);
    if (this.apiKey) {
      console.log('🔑 API Key length:', this.apiKey.length);
      console.log('🔑 API Key prefix:', this.apiKey.substring(0, 10) + '...');
    }
    console.log('🎭 Emotion Model: Xenova/facial_emotions_image_detection');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async analyzeEmotion(base64Image) {
    try {
      if (!this.apiKey) {
        throw new Error('HUGGINGFACE_API_KEY not configured');
      }

      console.log('🎭 Starting emotion analysis...');

      const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(imageData, 'base64');

      console.log('🤖 Using model: Xenova/facial_emotions_image_detection');

      // Try up to 3 times with wait for model loading
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`📡 Attempt ${attempt}/3...`);

          const response = await axios.post(
            this.emotionModelUrl,
            buffer,
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/octet-stream',
              },
              timeout: 60000,
            }
          );

          console.log('📊 Raw response:', JSON.stringify(response.data).substring(0, 300));

          let emotions = response.data;
          
          // Handle array of emotions
          if (Array.isArray(emotions) && emotions.length > 0) {
            // Sort by score to get top emotion
            const sortedEmotions = emotions.sort((a, b) => b.score - a.score);
            const topEmotion = sortedEmotions[0];

            console.log(`✅ SUCCESS! Emotion: ${topEmotion.label} (${(topEmotion.score * 100).toFixed(1)}%)`);
            console.log(`📊 All emotions:`, sortedEmotions.slice(0, 3).map(e => `${e.label}: ${(e.score * 100).toFixed(1)}%`).join(', '));

            return {
              emotion: this.normalizeEmotionLabel(topEmotion.label),
              confidence: topEmotion.score,
              allEmotions: sortedEmotions.map(e => ({
                emotion: this.normalizeEmotionLabel(e.label),
                confidence: e.score
              })),
              timestamp: Date.now(),
              model: 'Xenova/facial_emotions_image_detection'
            };
          }

          // Handle nested array [[{...}]]
          if (Array.isArray(emotions[0]) && Array.isArray(emotions[0])) {
            const emotionList = emotions[0];
            const sortedEmotions = emotionList.sort((a, b) => b.score - a.score);
            const topEmotion = sortedEmotions[0];

            console.log(`✅ SUCCESS! Emotion: ${topEmotion.label} (${(topEmotion.score * 100).toFixed(1)}%)`);

            return {
              emotion: this.normalizeEmotionLabel(topEmotion.label),
              confidence: topEmotion.score,
              allEmotions: sortedEmotions.map(e => ({
                emotion: this.normalizeEmotionLabel(e.label),
                confidence: e.score
              })),
              timestamp: Date.now(),
              model: 'Xenova/facial_emotions_image_detection'
            };
          }

          throw new Error('Unexpected response format: ' + JSON.stringify(emotions).substring(0, 100));

        } catch (error) {
          const status = error.response?.status;
          console.error(`❌ Attempt ${attempt} failed (${status || 'no status'}):`, error.message);

          // Model loading - wait and retry
          if (status === 503 && attempt < 3) {
            const waitTime = attempt * 10000; // 10s, 20s
            console.log(`⏳ Model loading... waiting ${waitTime/1000} seconds before retry...`);
            await this.sleep(waitTime);
            continue;
          }

          // On last attempt or other errors, throw
          if (attempt === 3) {
            throw error;
          }
        }
      }

      throw new Error('Failed after 3 attempts');

    } catch (error) {
      console.error('❌ Final error:', error.message);
      
      const status = error.response?.status;
      
      if (status === 503) {
        throw new Error('Model is still loading. Please wait 30-60 seconds and try again.');
      } else if (status === 401) {
        throw new Error('Invalid API key - check your .env file');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded - please wait a moment');
      } else if (status === 400) {
        throw new Error('Invalid image format - ensure image is properly encoded');
      }
      
      throw new Error(`Emotion analysis failed: ${error.message}`);
    }
  }

  normalizeEmotionLabel(label) {
    const normalized = label.toLowerCase().trim();
    
    // Map various label formats to standard emotions
    const emotionMap = {
      'happy': 'happy',
      'happiness': 'happy',
      'joy': 'happy',
      'sad': 'sad',
      'sadness': 'sad',
      'angry': 'angry',
      'anger': 'angry',
      'fear': 'fearful',
      'fearful': 'fearful',
      'scared': 'fearful',
      'surprise': 'surprised',
      'surprised': 'surprised',
      'disgust': 'disgusted',
      'disgusted': 'disgusted',
      'neutral': 'neutral',
      'calm': 'neutral'
    };
    
    return emotionMap[normalized] || normalized;
  }

  async generateHint(question, options, emotionalContext = null) {
    try {
      if (!this.apiKey || !this.textModelUrl) {
        return this.generateFallbackHint(question, options);
      }

      const prompt = this.buildHintPrompt(question, options, emotionalContext);
      const response = await axios.post(
        this.textModelUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false,
            do_sample: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const generatedText = response.data[0]?.generated_text || '';
      return this.cleanHintText(generatedText);
    } catch (error) {
      console.error('❌ Hint generation error:', error.message);
      return this.generateFallbackHint(question, options);
    }
  }

  async generateFeedback(studentData) {
    try {
      if (!this.apiKey || !this.textModelUrl) {
        return this.generateFallbackFeedback(studentData);
      }

      const prompt = this.buildFeedbackPrompt(studentData);
      const response = await axios.post(
        this.textModelUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.8,
            top_p: 0.95,
            return_full_text: false,
            do_sample: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const feedback = response.data[0]?.generated_text || '';
      return this.cleanFeedbackText(feedback);
    } catch (error) {
      console.error('❌ Feedback generation error:', error.message);
      return this.generateFallbackFeedback(studentData);
    }
  }

  buildHintPrompt(question, options, emotionalContext) {
    const optionsText = options.map((opt, idx) => 
      `${String.fromCharCode(65 + idx)}) ${opt}`
    ).join('\n');

    const emotionNote = emotionalContext ? `The student seems ${emotionalContext}.` : '';

    return `You are a helpful tutor. Provide a brief hint (1-2 sentences) for this question without revealing the answer.

Question: ${question}

Options:
${optionsText}

${emotionNote}

Hint:`;
  }

  buildFeedbackPrompt(studentData) {
    const { score, totalQuestions, hintsUsed, emotionalSummary } = studentData;
    const percentage = ((score / totalQuestions) * 100).toFixed(1);

    return `You are an encouraging teacher. Provide personalized feedback (3-5 sentences) for a student who:
- Scored ${score}/${totalQuestions} (${percentage}%)
- Used ${hintsUsed} hints
- Showed these emotions: ${emotionalSummary}

Be constructive, encouraging, and specific. Mention their emotional patterns and suggest improvements.

Feedback:`;
  }

  cleanHintText(text) {
    let cleaned = text.trim().split('\n')[0];
    if (cleaned.length > 200) {
      cleaned = cleaned.substring(0, 197) + '...';
    }
    return cleaned || 'Think about the key concepts in this question.';
  }

  cleanFeedbackText(text) {
    let cleaned = text.trim();
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 497) + '...';
    }
    return cleaned || 'You made a good effort. Keep practicing to improve!';
  }

  generateFallbackHint(question, options) {
    return 'Consider the key terms in the question and eliminate obviously incorrect answers first.';
  }

  generateFallbackFeedback(studentData) {
    const { score, totalQuestions, hintsUsed } = studentData;
    const percentage = ((score / totalQuestions) * 100).toFixed(1);
    
    let feedback = `You scored ${score} out of ${totalQuestions} (${percentage}%). `;
    
    if (percentage >= 80) {
      feedback += 'Excellent work! You have a strong grasp of the material. ';
    } else if (percentage >= 60) {
      feedback += 'Good effort! There\'s room for improvement in some areas. ';
    } else {
      feedback += 'Keep practicing. Review the material and try again. ';
    }
    
    if (hintsUsed > 0) {
      feedback += `You used ${hintsUsed} hints, which shows you\'re thinking critically. `;
    }
    
    feedback += 'Keep up the great work!';
    return feedback;
  }

  async testConnection() {
    try {
      console.log('🔍 Testing Hugging Face API with Xenova/facial_emotions_image_detection...');
      const response = await axios.get(
        this.emotionModelUrl,
        {
          headers: { 'Authorization': `Bearer ${this.apiKey}` },
          timeout: 15000
        }
      );
      console.log('✅ API connection verified - Model is accessible');
      return true;
    } catch (error) {
      const status = error.response?.status;
      console.error('❌ API test failed:', status || error.code, '-', error.message);
      
      // 503 means model is loading - it will work when called
      if (status === 503) {
        console.log('⏳ Model is loading on first access - this is normal, it will work when you analyze emotions');
        return true;
      }
      
      if (status === 401) {
        console.error('🔑 Invalid API key - check your .env file');
        return false;
      }
      
      return false;
    }
  }
}

export default new AIService();