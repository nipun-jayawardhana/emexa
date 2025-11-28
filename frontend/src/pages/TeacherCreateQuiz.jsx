import React, { useState, useEffect } from "react";

const TeacherCreateQuiz = ({ setActiveMenuItem, editingDraftId }) => {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isGradeLevelOpen, setIsGradeLevelOpen] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Load draft data if editing
  useEffect(() => {
    if (editingDraftId) {
      // Prevent repeatedly auto-loading the same draft during the same session.
      const loadedFlag = sessionStorage.getItem(
        `loadedDraft_${editingDraftId}`
      );
      if (loadedFlag) return;

      const savedDrafts = JSON.parse(
        localStorage.getItem("quizDrafts") || "[]"
      );
      const draftToEdit = savedDrafts.find((d) => d.id === editingDraftId);
      if (draftToEdit && draftToEdit.fullData) {
        setAssignmentTitle(draftToEdit.fullData.assignmentTitle);
        setSubject(draftToEdit.fullData.subject);
        setSelectedGrades(draftToEdit.fullData.selectedGrades);
        setDueDate(draftToEdit.fullData.dueDate);

        // Normalize questions to ensure `hints` exists (support legacy `hint`)
        const normalized = (draftToEdit.fullData.questions || []).map(
          (q, idx) => ({
            id: q.id || idx + 1,
            type: q.type || "mcq",
            questionText: q.questionText || "",
            options:
              q.options ||
              (q.type === "mcq"
                ? [
                    { id: 1, text: "", isCorrect: false },
                    { id: 2, text: "", isCorrect: false },
                  ]
                : []),
            shortAnswer: q.shortAnswer || "",
            hints: Array.isArray(q.hints)
              ? q.hints.slice(0, 4)
              : q.hint
              ? [q.hint]
              : q.hints === undefined
              ? [""]
              : [],
          })
        );
        setQuestions(normalized);

        // mark as loaded in this session so returning to the page doesn't auto-open again
        sessionStorage.setItem(`loadedDraft_${editingDraftId}`, "true");
      }
    }
  }, [editingDraftId]);

  // If there's no editingDraftId (user navigated back to create page),
  // reset the form state so stale draft values don't remain visible.
  useEffect(() => {
    if (!editingDraftId) {
      setAssignmentTitle("");
      setSubject("");
      setDueDate("");
      setSelectedGrades([]);
      setQuestions([]);
      setIsGradeLevelOpen(false);
    }
  }, [editingDraftId]);

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
      type: "mcq",
      questionText: "",
      options: [
        { id: 1, text: "", isCorrect: false },
        { id: 2, text: "", isCorrect: false },
      ],
      shortAnswer: "",
      hints: [""], // Changed from single hint to array of hints
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestionType = (questionId, type) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, type: type } : q))
    );
  };

  const updateQuestionText = (questionId, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, questionText: value } : q
      )
    );
  };

  const updateHint = (questionId, hintIndex, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newHints = [...(q.hints || [""])];
          newHints[hintIndex] = value;
          return { ...q, hints: newHints };
        }
        return q;
      })
    );
  };

  const addHint = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const currentHints = q.hints || [""];
          if (currentHints.length < 4) {
            return { ...q, hints: [...currentHints, ""] };
          }
        }
        return q;
      })
    );
  };

  const removeHint = (questionId, hintIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newHints = (q.hints || [""]).filter((_, i) => i !== hintIndex);
          return { ...q, hints: newHints.length > 0 ? newHints : [""] };
        }
        return q;
      })
    );
  };

  const addAnswerOption = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptionId = q.options.length + 1;
          return {
            ...q,
            options: [
              ...q.options,
              { id: newOptionId, text: "", isCorrect: false },
            ],
          };
        }
        return q;
      })
    );
  };

  const removeAnswerOption = (questionId, optionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((opt) => opt.id !== optionId),
          };
        }
        return q;
      })
    );
  };

  const updateAnswerOption = (questionId, optionId, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, text: value } : opt
            ),
          };
        }
        return q;
      })
    );
  };

  const markAsCorrect = (questionId, optionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt) => ({
              ...opt,
              isCorrect: opt.id === optionId,
            })),
          };
        }
        return q;
      })
    );
  };

  const handleCreateAssignment = () => {
    if (
      !assignmentTitle ||
      !subject ||
      selectedGrades.length === 0 ||
      !dueDate
    ) {
      alert(
        "Please fill in all assignment details (Title, Subject, Grade Level, and Due Date)"
      );
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const savedDrafts = JSON.parse(localStorage.getItem("quizDrafts") || "[]");

    const totalQuestions = questions.length;
    const filledQuestions = questions.filter(
      (q) =>
        q.questionText && q.options.some((opt) => opt.text && opt.isCorrect)
    ).length;
    const progress = Math.round((filledQuestions / totalQuestions) * 100);

    const gradeLabels = gradeOptions
      .filter((g) => selectedGrades.includes(g.id))
      .map((g) => g.label);
    const firstGrade = gradeLabels[0] || "";

    const draftData = {
      id: editingDraftId || Date.now(),
      title: assignmentTitle,
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      grade: firstGrade.split(" ")[0] + " " + firstGrade.split(" ")[1],
      semester: firstGrade.includes("1st Sem") ? "1st sem" : "2nd sem",
      progress: progress,
      questions: totalQuestions,
      lastEdited: "Just now",
      fullData: {
        assignmentTitle,
        subject,
        selectedGrades,
        dueDate,
        questions,
      },
    };

    let updatedDrafts;
    if (editingDraftId) {
      updatedDrafts = savedDrafts.map((draft) =>
        draft.id === editingDraftId ? draftData : draft
      );
    } else {
      updatedDrafts = [draftData, ...savedDrafts];
    }

    localStorage.setItem("quizDrafts", JSON.stringify(updatedDrafts));
    setActiveMenuItem("quiz-drafts");
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
          <span className="text-sm font-medium">Back to Quizzes</span>
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
            <input
              type="text"
              list="subject-options"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm placeholder-gray-400"
              placeholder="Enter subject"
            />
            <datalist id="subject-options">
              <option value="Mathematics" />
              <option value="Science" />
              <option value="English" />
              <option value="History" />
              <option value="Geography" />
              <option value="Physics" />
              <option value="Chemistry" />
              <option value="Biology" />
              <option value="Computer Science" />
              <option value="Art" />
            </datalist>
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
                  updateQuestionText(question.id, e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm placeholder-gray-400 resize-none"
                rows="2"
                placeholder="Enter question text"
              />
            </div>

            {/* MCQ Answer Options */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Options (click to mark as correct)
              </label>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-2 group"
                  >
                    <button
                      type="button"
                      onClick={() => markAsCorrect(question.id, option.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                        option.isCorrect
                          ? "border-green-600 bg-green-600"
                          : "border-gray-300 hover:border-teal-500"
                      }`}
                    >
                      {option.isCorrect && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        updateAnswerOption(
                          question.id,
                          option.id,
                          e.target.value
                        )
                      }
                      className={`flex-1 px-4 py-2.5 border rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm placeholder-gray-400 transition ${
                        option.isCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter answer option"
                    />
                    <button
                      type="button"
                      onClick={() => removeAnswerOption(question.id, option.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      disabled={question.options.length <= 2}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addAnswerOption(question.id)}
                className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium text-sm mt-3"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Answer Option
              </button>
            </div>

            {/* Hints Section - Now Multiple */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hints/Explanations (up to 4)
              </label>
              <div className="space-y-3">
                {(question.hints || [""]).map((hint, hintIndex) => (
                  <div key={hintIndex} className="flex items-start gap-2 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold mt-2">
                      {hintIndex + 1}
                    </div>
                    <textarea
                      value={hint}
                      onChange={(e) =>
                        updateHint(question.id, hintIndex, e.target.value)
                      }
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm placeholder-gray-400 resize-none"
                      rows="2"
                      placeholder={`Enter hint ${hintIndex + 1} (optional)`}
                    />
                    {(question.hints || [""]).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHint(question.id, hintIndex)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition mt-2"
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
                    )}
                  </div>
                ))}
              </div>
              {(question.hints || [""]).length < 4 && (
                <button
                  type="button"
                  onClick={() => addHint(question.id)}
                  className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium text-sm mt-3"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Another Hint
                </button>
              )}
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
          <button
            onClick={handleCreateAssignment}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm"
          >
            Create Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreateQuiz;
