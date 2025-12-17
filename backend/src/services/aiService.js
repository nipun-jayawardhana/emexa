import axios from 'axios';

class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.emotionModelUrl = process.env.EMOTION_MODEL_URL;
    this.textModelUrl = process.env.TEXT_MODEL_URL;
  }

  /**
   * Analyze emotion from base64 image
   */
  async analyzeEmotion(base64Image) {
    try {
      // Remove data:image prefix if present
      const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(imageData, 'base64');

      const response = await axios.post(
        this.emotionModelUrl,
        buffer,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds
        }
      );

      // Response format: [{ label: 'happy', score: 0.95 }, ...]
      const emotions = response.data;
      
      if (!emotions || emotions.length === 0) {
        throw new Error('No emotion data returned');
      }

      // Get highest confidence emotion
      const topEmotion = emotions.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
      );

      return {
        emotion: topEmotion.label,
        confidence: topEmotion.score,
        allEmotions: emotions
      };
    } catch (error) {
      console.error('Emotion analysis error:', error.message);
      throw new Error(`Emotion analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate hint using AI
   */
  async generateHint(question, options, emotionalContext = null) {
    try {
      const prompt = this.buildHintPrompt(question, options, emotionalContext);

      const response = await axios.post(
        this.textModelUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
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
      console.error('Hint generation error:', error.message);
      // Fallback hint
      return this.generateFallbackHint(question, options);
    }
  }

  /**
   * Generate personalized feedback
   */
  async generateFeedback(studentData) {
    try {
      const prompt = this.buildFeedbackPrompt(studentData);

      const response = await axios.post(
        this.textModelUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.8,
            top_p: 0.95,
            return_full_text: false
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
      console.error('Feedback generation error:', error.message);
      return this.generateFallbackFeedback(studentData);
    }
  }

  // Helper methods
  buildHintPrompt(question, options, emotionalContext) {
    const optionsText = options.map((opt, idx) => 
      `${String.fromCharCode(65 + idx)}) ${opt}`
    ).join('\n');

    const emotionNote = emotionalContext 
      ? `The student seems ${emotionalContext}.` 
      : '';

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
    // Remove extra whitespace and truncate
    let cleaned = text.trim().split('\n')[0]; // Take first line
    if (cleaned.length > 200) {
      cleaned = cleaned.substring(0, 197) + '...';
    }
    return cleaned || 'Think about the key concepts in this question.';
  }

  cleanFeedbackText(text) {
    // Clean and format feedback
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
}

export default new AIService();