import axios from 'axios';

class AIService {
  constructor() {
    // Get API key dynamically each time (not cached)
    this.getApiKey = () => process.env.HUGGINGFACE_API_KEY;
    
    this.textModelUrl = process.env.TEXT_MODEL_URL || 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';
    
    // Use CLIP for zero-shot emotion classification - FREE and WORKING!
    this.emotionModelUrl = 'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32';
    
    console.log('🤖 AI Service initialized');
    console.log('🔑 API Key configured:', !!this.getApiKey());
    if (this.getApiKey()) {
      console.log('🔑 API Key length:', this.getApiKey().length);
      console.log('🔑 API Key prefix:', this.getApiKey().substring(0, 10) + '...');
    }
    console.log('🎭 Emotion Model: CLIP (openai/clip-vit-base-patch32)');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async analyzeEmotion(base64Image) {
    try {
      const apiKey = this.getApiKey(); // Get fresh API key
      
      if (!apiKey) {
        throw new Error('HUGGINGFACE_API_KEY not configured');
      }

      console.log('🎭 Starting emotion analysis with CLIP zero-shot...');
      console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');

      const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(imageData, 'base64');

      console.log('🤖 Using model: CLIP (openai/clip-vit-base-patch32)');

      // Define emotion labels for CLIP
      const emotionLabels = [
        'a photo of a happy person',
        'a photo of a sad person',
        'a photo of an angry person',
        'a photo of a fearful person',
        'a photo of a surprised person',
        'a photo of a disgusted person',
        'a photo of a neutral person'
      ];

      // Try up to 3 times with wait for model loading
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`📡 Attempt ${attempt}/3...`);

          const response = await axios.post(
            this.emotionModelUrl,
            {
              inputs: buffer.toString('base64'),
              parameters: {
                candidate_labels: emotionLabels
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 60000,
            }
          );

          console.log('📊 Raw response:', JSON.stringify(response.data).substring(0, 300));

          let results = response.data;
          
          // CLIP returns array of {label, score} objects
          if (Array.isArray(results) && results.length > 0) {
            // Sort by score
            const sortedResults = results.sort((a, b) => b.score - a.score);
            const topResult = sortedResults[0];

            // Extract emotion from label (remove "a photo of a " and " person")
            const extractEmotion = (label) => {
              return label.replace(/a photo of a /i, '').replace(/ person/i, '').trim();
            };

            const topEmotion = extractEmotion(topResult.label);

            console.log(`✅ SUCCESS! Emotion: ${topEmotion} (${(topResult.score * 100).toFixed(1)}%)`);
            console.log(`📊 All emotions:`, sortedResults.slice(0, 3).map(e => `${extractEmotion(e.label)}: ${(e.score * 100).toFixed(1)}%`).join(', '));

            return {
              emotion: this.normalizeEmotionLabel(topEmotion),
              confidence: topResult.score,
              allEmotions: sortedResults.map(e => ({
                emotion: this.normalizeEmotionLabel(extractEmotion(e.label)),
                confidence: e.score
              })),
              timestamp: Date.now(),
              model: 'CLIP (openai/clip-vit-base-patch32)'
            };
          }

          throw new Error('Unexpected response format: ' + JSON.stringify(results).substring(0, 100));

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
      const apiKey = this.getApiKey(); // Get fresh API key
      
      if (!apiKey || !this.textModelUrl) {
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
            'Authorization': `Bearer ${apiKey}`,
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
      const apiKey = this.getApiKey(); // Get fresh API key
      
      if (!apiKey || !this.textModelUrl) {
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
            'Authorization': `Bearer ${apiKey}`,
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
      const apiKey = this.getApiKey(); // Get fresh API key
      
      console.log('🔍 Testing Hugging Face API with CLIP (openai/clip-vit-base-patch32)...');
      const response = await axios.get(
        this.emotionModelUrl,
        {
          headers: { 'Authorization': `Bearer ${apiKey}` },
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