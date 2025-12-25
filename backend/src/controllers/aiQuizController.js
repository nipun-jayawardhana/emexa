// backend/src/controllers/aiQuizController.js
import aiService from '../services/aiService.js';
import TeacherQuiz from '../models/teacherQuiz.js';
import Teacher from '../models/teacher.js';

class aiQuizController {
  /**
   * Generate quiz using AI
   */
  async generateQuiz(req, res) {
    try {
      const teacherId = req.user.id;
      const {
        assignmentTitle,
        subject,
        gradeLevel,
        numberOfQuestions = 5,
        difficultyLevel = 'medium',
        topics = [],
        aiProvider = 'gemini'
      } = req.body;

      // Validate input
      if (!assignmentTitle || !subject || !gradeLevel) {
        return res.status(400).json({
          success: false,
          message: 'Assignment title, subject, and grade level are required'
        });
      }

      if (numberOfQuestions < 1 || numberOfQuestions > 20) {
        return res.status(400).json({
          success: false,
          message: 'Number of questions must be between 1 and 20'
        });
      }

      // Verify teacher exists
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      console.log('🤖 Generating quiz with AI:', { subject, gradeLevel, numberOfQuestions, difficultyLevel });

      // Generate quiz using AI
      const generatedQuestions = await aiService.generateQuiz({
        subject,
        gradeLevel,
        numberOfQuestions,
        difficultyLevel,
        topics,
        aiProvider
      });

      console.log('✅ AI generated', generatedQuestions.length, 'questions');

      // Create quiz draft (not published yet, so teacher can edit)
      const quizData = {
        teacherId,
        title: assignmentTitle,
        subject,
        gradeLevel: [gradeLevel], // Array format to match your schema
        questions: generatedQuestions.map((q, index) => ({
          id: index + 1,
          type: q.type,
          questionText: q.questionText,
          options: q.options,
          hints: q.hints,
          shortAnswer: '',
        })),
        status: 'draft',
        isScheduled: false,
        aiGenerated: true,
        aiProvider,
      };

      const quiz = new TeacherQuiz(quizData);
      await quiz.save();

      console.log('💾 Quiz saved as draft:', quiz._id);

      res.status(201).json({
        success: true,
        message: 'Quiz generated successfully. You can now review and edit before publishing.',
        data: {
          quizId: quiz._id,
          quiz: quizData,
          questionsGenerated: generatedQuestions.length
        }
      });
    } catch (error) {
      console.error('❌ Error generating quiz:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate quiz',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Regenerate specific questions
   */
  async regenerateQuestions(req, res) {
    try {
      const { quizId } = req.params;
      const { questionNumbers, subject, gradeLevel, difficultyLevel } = req.body;

      if (!questionNumbers || !Array.isArray(questionNumbers) || questionNumbers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Question numbers to regenerate are required'
        });
      }

      const quiz = await TeacherQuiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // Verify ownership
      if (quiz.teacherId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to modify this quiz'
        });
      }

      console.log('🔄 Regenerating questions:', questionNumbers);

      // Generate new questions
      const newQuestions = await aiService.generateQuiz({
        subject: subject || quiz.subject,
        gradeLevel: gradeLevel || quiz.gradeLevel[0],
        numberOfQuestions: questionNumbers.length,
        difficultyLevel: difficultyLevel || 'medium'
      });

      // Replace specified questions
      questionNumbers.forEach((qNum, index) => {
        const questionIndex = quiz.questions.findIndex(q => q.id === qNum);
        if (questionIndex !== -1 && newQuestions[index]) {
          quiz.questions[questionIndex] = {
            id: qNum,
            type: newQuestions[index].type,
            questionText: newQuestions[index].questionText,
            options: newQuestions[index].options,
            hints: newQuestions[index].hints,
            shortAnswer: '',
          };
        }
      });

      await quiz.save();

      res.json({
        success: true,
        message: 'Questions regenerated successfully',
        data: { quiz }
      });
    } catch (error) {
      console.error('❌ Error regenerating questions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate questions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Enhance a specific question
   */
  async enhanceQuestion(req, res) {
    try {
      const { quizId, questionNumber } = req.params;

      const quiz = await TeacherQuiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // Verify ownership
      if (quiz.teacherId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to modify this quiz'
        });
      }

      const question = quiz.questions.find(q => q.id === parseInt(questionNumber));
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      // Enhance the question
      const enhancements = await aiService.enhanceQuestion(question);

      res.json({
        success: true,
        message: 'Question enhancements generated',
        data: {
          original: question,
          enhancements
        }
      });
    } catch (error) {
      console.error('❌ Error enhancing question:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enhance question',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update quiz after AI generation (teacher editing)
   */
  async updateGeneratedQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const updateData = req.body;

      const quiz = await TeacherQuiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // Verify ownership
      if (quiz.teacherId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to modify this quiz'
        });
      }

      // Update allowed fields
      const allowedUpdates = [
        'title', 'subject', 'gradeLevel', 'questions', 
        'status', 'isScheduled'
      ];

      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          quiz[field] = updateData[field];
        }
      });

      await quiz.save();

      res.json({
        success: true,
        message: 'Quiz updated successfully',
        data: { quiz }
      });
    } catch (error) {
      console.error('❌ Error updating quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quiz',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get AI generation suggestions
   */
  async getGenerationSuggestions(req, res) {
    try {
      const { subject, gradeLevel } = req.query;

      const suggestions = {
        recommendedQuestions: this.getRecommendedQuestionCount(gradeLevel),
        difficultyLevels: ['easy', 'medium', 'hard'],
        topicSuggestions: this.getTopicSuggestions(subject, gradeLevel),
        timeLimitSuggestions: this.getTimeLimitSuggestions(gradeLevel)
      };

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('❌ Error getting suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get suggestions'
      });
    }
  }

  // Helper methods
  getRecommendedQuestionCount(gradeLevel) {
    // For university level, adjust based on year/sem
    return 10; // Default for university
  }

  getTopicSuggestions(subject, gradeLevel) {
    const topicMap = {
      'Mathematics': ['Algebra', 'Calculus', 'Statistics', 'Linear Algebra', 'Discrete Math'],
      'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Databases', 'Networks'],
      'Physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Quantum'],
      'Chemistry': ['Organic', 'Inorganic', 'Physical Chemistry', 'Analytical', 'Biochemistry'],
      'Biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Physiology'],
      'Engineering': ['Circuits', 'Mechanics', 'Materials', 'Thermodynamics', 'Design'],
      'Business': ['Marketing', 'Finance', 'Management', 'Economics', 'Accounting'],
      'English': ['Grammar', 'Literature', 'Writing', 'Composition', 'Critical Analysis']
    };

    return topicMap[subject] || [];
  }

  getTimeLimitSuggestions(gradeLevel) {
    return [30, 45, 60, 90]; // University level time limits in minutes
  }
}

export default new aiQuizController();