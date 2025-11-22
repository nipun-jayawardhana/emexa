import React, { useState, useEffect } from 'react';
import { Clock, Home, Lightbulb, ChevronRight, ChevronLeft, Check, X } from 'lucide-react';

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeOnQuestion, setTimeOnQuestion] = useState(0);
  const [showBulb, setShowBulb] = useState(false);
  const [showEmojiDialog, setShowEmojiDialog] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all'); // Start with NO filter selected

  const sampleQuestions = [
    {
      id: 1,
      text: "Which of the following is NOT a characteristic of living organisms?",
      options: [
        "Growth and development",
        "Response to environment",
        "Crystalline structure",
        "Reproduction"
      ],
      correctAnswer: 2,
      hints: [
        "This process occurs in plants and some bacteria.",
        "It involves the conversion of carbon dioxide and water into glucose and oxygen.",
        "Chlorophyll is essential for this process.",
        "The answer is related to photosynthesis characteristics."
      ]
    },
    {
      id: 2,
      text: "What is the powerhouse of the cell?",
      options: [
        "Nucleus",
        "Mitochondria",
        "Ribosome",
        "Endoplasmic reticulum"
      ],
      correctAnswer: 1,
      hints: [
        "This organelle is responsible for energy production.",
        "It produces ATP through cellular respiration.",
        "It has its own DNA.",
        "Often called the energy factory of the cell."
      ]
    },
    {
      id: 3,
      text: "Which of the following is NOT a nucleotide found in DNA?",
      options: [
        "Adenine",
        "Guanine",
        "Uracil",
        "Cytosine"
      ],
      correctAnswer: 2,
      hints: [
        "DNA contains four bases.",
        "This nucleotide is found in RNA, not DNA.",
        "Thymine replaces this base in DNA.",
        "The answer starts with 'U'."
      ]
    },
    {
      id: 4,
      text: "Which organelle is responsible for protein synthesis?",
      options: [
        "Golgi apparatus",
        "Lysosome",
        "Ribosome",
        "Peroxisome"
      ],
      correctAnswer: 2,
      hints: [
        "These are found on the rough endoplasmic reticulum.",
        "They translate mRNA into proteins.",
        "They can be free-floating or attached.",
        "They read messenger RNA sequences."
      ]
    },
    {
      id: 5,
      text: "Which of the following is NOT a function of proteins in the human body?",
      options: [
        "Energy storage",
        "Structural support",
        "Transport of substances",
        "Catalyzing biochemical reactions"
      ],
      correctAnswer: 0,
      hints: [
        "Proteins have many functions but one is primarily handled by other molecules.",
        "Fats and carbohydrates are better suited for this function.",
        "This is not a primary role of proteins.",
        "Think about what lipids do better than proteins."
      ]
    }
  ];

  const quizData = {
    title: "Introduction to Biology",
    questions: sampleQuestions
  };

  // Timer effect for current question
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnQuestion(prev => prev + 1);
      if (timeOnQuestion >= 60 && !showBulb && !answers[currentQuestion]) {
        setShowBulb(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeOnQuestion, showBulb, currentQuestion, answers]);

  // Overall quiz timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTime(Math.floor((Date.now() - quizStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStartTime]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeOnQuestion(0);
    setShowBulb(false);
    setShowEmojiDialog(false);
    setShowHints(false);
    setRevealedHints([]);
  }, [currentQuestion]);

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleBulbClick = () => {
    setShowEmojiDialog(true);
  };

  const handleEmojiClick = (emoji) => {
    if (emoji === 'confused' || emoji === 'frustrated') {
      setShowHints(true);
    }
    setShowEmojiDialog(false);
  };

  const handleRevealHint = (index) => {
    setRevealedHints([...revealedHints, index]);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setQuizSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if question matches current filter
  const matchesFilter = (index) => {
    const answered = answers[index] !== undefined;
    const isCurrent = index === currentQuestion;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'current') return isCurrent;
    if (activeFilter === 'answered') return answered;
    if (activeFilter === 'unanswered') return !answered;
    
    return true;
  };

  const handleFilterClick = (filter) => {
    // Always switch to the clicked filter (don't toggle off)
    setActiveFilter(filter);
  };

  if (quizSubmitted) {
    const score = calculateScore();
    const percentage = Math.round((score / quizData.questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8">
          <div className="bg-teal-700 text-white px-6 py-4 rounded-t-xl -mx-8 -mt-8 mb-8">
            <h2 className="text-2xl font-bold">Quiz Results: {quizData.title}</h2>
          </div>

          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <Check className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Quiz Successfully Submitted!</h3>
            <p className="text-gray-600">Thank you for completing the quiz. Your responses have been recorded.</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h4 className="text-xl font-semibold text-gray-800">Quiz Summary</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm mb-1">Date Submitted:</p>
                <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Time Taken:</p>
                <p className="font-semibold text-gray-800">{Math.floor(totalTime / 60)} minutes</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Questions Answered:</p>
                <p className="font-semibold text-gray-800">{Object.keys(answers).length} of {quizData.questions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Your Score</h3>
              <div className="text-5xl font-bold text-red-500">{percentage}%</div>
            </div>
            <p className="text-gray-700 mb-4">You answered <span className="font-bold">{score} out of {quizData.questions.length}</span> questions correctly</p>
          </div>

          {quizData.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div key={question.id} className="mb-6 border rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 flex-1">
                    Question {question.id}: {question.text}
                  </h4>
                  {isCorrect ? (
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                  ) : (
                    <X className="w-6 h-6 text-red-500 flex-shrink-0 ml-4" />
                  )}
                </div>

                <div className="space-y-3">
                  {userAnswer !== undefined && (
                    <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                      <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {question.options[userAnswer]}
                      </p>
                    </div>
                  )}

                  {!isCorrect && (
                    <div className="p-3 rounded-lg bg-teal-50">
                      <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                      <p className="font-medium text-teal-800">{question.options[question.correctAnswer]}</p>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-sm text-gray-600 mb-1">Explanation:</p>
                    <p className="text-blue-800">{question.hints[3]}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              Return Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-green-100 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Questions</h2>
        
        <div className="grid grid-cols-4 gap-2 mb-8">
          {quizData.questions.map((_, index) => {
            const answered = answers[index] !== undefined;
            const isCurrent = index === currentQuestion;
            const highlightQuestion = matchesFilter(index);
            
            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`
                  w-12 h-12 rounded-lg font-semibold flex items-center justify-center transition-all relative
                  ${isCurrent && activeFilter === 'all' ? 'bg-teal-700 text-white ring-4 ring-teal-300' : 
                    isCurrent && activeFilter !== 'all' ? 'bg-teal-700 text-white' :
                    answered ? 'bg-white text-teal-700 border-2 border-teal-700' : 
                    'bg-white text-gray-400 border-2 border-gray-200'}
                  ${highlightQuestion && !isCurrent && activeFilter !== 'all' ? 'bg-teal-50' : ''}
                  ${!highlightQuestion && activeFilter !== 'all' ? 'opacity-40' : ''}
                `}
              >
                {index + 1}
                {answered && !isCurrent && (
                  <div className="absolute -top-1 -right-1 bg-teal-700 rounded-full w-4 h-4 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleFilterClick('current')}
            className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
              activeFilter === 'current' ? 'bg-green-200' : 'hover:bg-green-50'
            }`}
          >
            <div className={`w-4 h-4 rounded ${
              activeFilter === 'current' ? 'bg-green-500' : 'bg-white border-2 border-teal-700'
            }`}></div>
            <span className="text-sm text-gray-700">Current question</span>
          </button>
          <button
            onClick={() => handleFilterClick('answered')}
            className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
              activeFilter === 'answered' ? 'bg-green-200' : 'hover:bg-green-50'
            }`}
          >
            <div className={`w-4 h-4 rounded ${
              activeFilter === 'answered' ? 'bg-green-500' : 'bg-white border-2 border-teal-700'
            }`}></div>
            <span className="text-sm text-gray-700">Answered</span>
          </button>
          <button
            onClick={() => handleFilterClick('unanswered')}
            className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
              activeFilter === 'unanswered' ? 'bg-green-200' : 'hover:bg-green-50'
            }`}
          >
            <div className={`w-4 h-4 rounded ${
              activeFilter === 'unanswered' ? 'bg-green-500' : 'bg-white border-2 border-teal-700'
            }`}></div>
            <span className="text-sm text-gray-700">Unanswered</span>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-teal-700 text-white py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors mb-8"
        >
          Submit Quiz
        </button>

        <div className="mt-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-12 h-12 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-center text-xs text-gray-600 font-semibold">EMEXA</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{quizData.title}</h1>
              <div className="flex items-center gap-2 text-teal-700">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{formatTime(totalTime)}</span>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{currentQuestion + 1} / {quizData.questions.length} Questions</p>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-md p-8 relative">
            {showBulb && (
              <button
                onClick={handleBulbClick}
                className="absolute top-6 right-6 animate-bounce"
              >
                <Lightbulb className="w-10 h-10 text-yellow-500 fill-yellow-200" />
              </button>
            )}

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Question {question.id}
            </h2>
            <p className="text-lg text-gray-700 mb-8">{question.text}</p>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${answers[currentQuestion] === index
                      ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${answers[currentQuestion] === index
                        ? 'border-teal-600 bg-teal-600'
                        : 'border-gray-300'
                      }
                    `}>
                      {answers[currentQuestion] === index && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Hints Section */}
            {showHints && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <h3 className="font-semibold text-gray-800">Need a hint?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  You have {question.hints.length} hints available. Each hint provides additional information.
                </p>

                <div className="space-y-3">
                  {question.hints.map((hint, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">Hint {index + 1}</span>
                        {!revealedHints.includes(index) && (
                          <button
                            onClick={() => handleRevealHint(index)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Reveal
                          </button>
                        )}
                      </div>
                      {revealedHints.includes(index) && (
                        <p className="text-gray-700">{hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors
                  ${currentQuestion === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentQuestion === quizData.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 transition-colors"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Dialog */}
      {showEmojiDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
              How are you feeling?
            </h3>
            <div className="flex justify-around">
              {[
                { emoji: '😊', label: 'Happy', value: 'happy' },
                { emoji: '😐', label: 'Neutral', value: 'neutral' },
                { emoji: '😕', label: 'Confused', value: 'confused' },
                { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
                { emoji: '😃', label: 'Excited', value: 'excited' }
              ].map(({ emoji, label, value }) => (
                <button
                  key={value}
                  onClick={() => handleEmojiClick(value)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-4xl">{emoji}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;