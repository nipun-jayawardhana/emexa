import React, { useState } from "react";

const TeacherCreateQuiz = ({ setActiveMenuItem }) => {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isGradeLevelOpen, setIsGradeLevelOpen] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [questions, setQuestions] = useState([]);

  const gradeOptions = [
    { id: "1-1", label: "1st Year 1st Sem" },
    { id: "1-2", label: "1st Year 2nd Sem" },
    { id: "2-1", label: "2nd Year 1st Sem" },
    { id: "2-2", label: "2nd Year 2nd Sem" },
    { id: "3-1", label: "3rd Year 1st Sem" },
    { id: "3-2", label: "3rd Year 2nd Sem" },
    { id: "4-1", label: "4th Year 1st Sem" },
    { id: "4-2", label: "4th Year 2nd Sem" },
  ];

  const toggleGrade = (gradeId) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleBackToDashboard = () => {
    setActiveMenuItem("quizzes");
  };

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      questionText: "",
      answers: "",
      hint: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  return (
    <div className="p-6">
      {/* Back Button and Header */}
      <div className="mb-6">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Assignment
          </h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Use AI Assistant
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        {/* Assignment Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Title
          </label>
          <input
            type="text"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm placeholder-gray-400"
            placeholder="Enter assignment title"
          />
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <div className="relative">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none appearance-none bg-white text-sm text-gray-500"
            >
              <option value="">Select a subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Grade Level and Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grade Level Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level
            </label>
            <button
              type="button"
              onClick={() => setIsGradeLevelOpen(!isGradeLevelOpen)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-sm text-gray-500 hover:border-gray-400 focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none flex items-center justify-between"
            >
              <span>Select grade level</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isGradeLevelOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isGradeLevelOpen && (
              <div className="w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                <div className="p-2">
                  {gradeOptions.map((grade) => (
                    <label
                      key={grade.id}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGrades.includes(grade.id)}
                        onChange={() => toggleGrade(grade.id)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">
                        {grade.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm text-gray-500"
              placeholder="mm/dd/yyyy"
            />
          </div>
        </div>
      </div>

      {/* Questions & Hints Card */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mt-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Questions & Hints
        </h2>

        {questions.map((question, index) => (
          <div
            key={question.id}
            className="mb-6 pb-6 border-b border-gray-200 last:border-b-0"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Question {index + 1}
              </h3>
              <button
                onClick={() => removeQuestion(question.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Question Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={question.questionText}
                onChange={(e) =>
                  updateQuestion(question.id, "questionText", e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm placeholder-gray-400 resize-none"
                rows="3"
                placeholder="Enter question text"
              />
            </div>

            {/* Answers */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answers
              </label>
              <textarea
                value={question.answers}
                onChange={(e) =>
                  updateQuestion(question.id, "answers", e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm placeholder-gray-400 resize-none"
                rows="3"
                placeholder="Enter Answer text"
              />
            </div>

            {/* Hint/Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hint/Explanation
              </label>
              <textarea
                value={question.hint}
                onChange={(e) =>
                  updateQuestion(question.id, "hint", e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm placeholder-gray-400 resize-none"
                rows="2"
                placeholder="Add a hint or explanation (optional)"
              />
            </div>
          </div>
        ))}

        {/* Add Another Question Button */}
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm mb-6"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Another Question
        </button>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleBackToDashboard}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Cancel
          </button>
          <button className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm">
            Create Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreateQuiz;
