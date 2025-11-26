import React, { useState, useEffect } from "react";

// Custom Time Picker Component
const CustomTimePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState("02");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("PM");

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      const hourNum = parseInt(h);
      const displayHour =
        hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const displayPeriod = hourNum >= 12 ? "PM" : "AM";
      setHour(displayHour.toString().padStart(2, "0"));
      setMinute(m);
      setPeriod(displayPeriod);
    }
  }, [value]);

  const handleApply = () => {
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    const timeString = `${hour24.toString().padStart(2, "0")}:${minute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const displayTime = value
    ? (() => {
        const [h, m] = value.split(":");
        const hourNum = parseInt(h);
        const displayHour =
          hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
        const displayPeriod = hourNum >= 12 ? "PM" : "AM";
        return `${displayHour
          .toString()
          .padStart(2, "0")}:${m} ${displayPeriod}`;
      })()
    : "Select time";

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-sm hover:border-gray-400 focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none flex items-center justify-between"
      >
        <span>{displayTime}</span>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
            <div className="flex gap-2 mb-4">
              {/* Hours */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 text-center mb-1">
                  Hour
                </div>
                <div className="border border-gray-200 rounded-lg h-40 overflow-y-auto">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHour(h)}
                      className={`w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                        hour === h
                          ? "bg-teal-600 text-white hover:bg-teal-700"
                          : ""
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 text-center mb-1">
                  Minute
                </div>
                <div className="border border-gray-200 rounded-lg h-40 overflow-y-auto">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinute(m)}
                      className={`w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                        minute === m
                          ? "bg-teal-600 text-white hover:bg-teal-700"
                          : ""
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div className="w-16">
                <div className="text-xs text-gray-500 text-center mb-1">
                  Period
                </div>
                <div className="border border-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPeriod("AM")}
                    className={`w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                      period === "AM"
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : ""
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("PM")}
                    className={`w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                      period === "PM"
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : ""
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApply}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm"
            >
              Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const TeacherQuizDraft = ({ setActiveMenuItem, setEditingDraftId }) => {
  const [draftQuizzes, setDraftQuizzes] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedQuizForSchedule, setSelectedQuizForSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  useEffect(() => {
    // Load drafts from localStorage
    const savedDrafts = localStorage.getItem("quizDrafts");
    if (savedDrafts) {
      setDraftQuizzes(JSON.parse(savedDrafts));
    } else {
      // Set default drafts if none exist
      const defaultDrafts = [
        {
          id: 1,
          title: "Calculus Midterm",
          subject: "Mathematics",
          grade: "1st Y",
          semester: "2nd sem",
          progress: 80,
          questions: 15,
          lastEdited: "2 hours ago",
        },
        {
          id: 2,
          title: "Probability",
          subject: "Statistics",
          grade: "1st Y",
          semester: "2nd sem",
          progress: 45,
          questions: 8,
          lastEdited: "1 day ago",
        },
        {
          id: 3,
          title: "Statistics",
          subject: "Mathematics",
          grade: "1st Y",
          semester: "2nd sem",
          progress: 60,
          questions: 12,
          lastEdited: "3 days ago",
        },
        {
          id: 4,
          title: "Vector Calculus",
          subject: "Mathematics",
          grade: "1st Y",
          semester: "2nd sem",
          progress: 30,
          questions: 6,
          lastEdited: "1 week ago",
        },
      ];
      setDraftQuizzes(defaultDrafts);
      localStorage.setItem("quizDrafts", JSON.stringify(defaultDrafts));
    }
  }, []);

  const handleBackToQuizzes = () => {
    setActiveMenuItem("quizzes");
  };

  const handleDeleteDraft = (id) => {
    const updatedDrafts = draftQuizzes.filter((quiz) => quiz.id !== id);
    setDraftQuizzes(updatedDrafts);
    localStorage.setItem("quizDrafts", JSON.stringify(updatedDrafts));
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const confirmDelete = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleScheduleQuiz = () => {
    if (!scheduleDate || !startTime || !endTime) {
      alert("Please select date, start time, and end time");
      return;
    }

    if (startTime >= endTime) {
      alert("End time must be after start time");
      return;
    }

    // Update the quiz with schedule information
    const updatedDrafts = draftQuizzes.map((quiz) =>
      quiz.id === selectedQuizForSchedule.id
        ? {
            ...quiz,
            scheduledDate: scheduleDate,
            startTime: startTime,
            endTime: endTime,
            isScheduled: true,
          }
        : quiz
    );

    setDraftQuizzes(updatedDrafts);
    localStorage.setItem("quizDrafts", JSON.stringify(updatedDrafts));

    // Close modal and reset
    setShowScheduleModal(false);
    setSelectedQuizForSchedule(null);
    setScheduleDate("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="p-6">
      {/* Back Button and Header */}
      <div className="mb-6">
        <button
          onClick={handleBackToQuizzes}
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

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Quiz Drafts</h1>
          <p className="text-gray-600 text-sm">
            Continue working on your saved quiz drafts
          </p>
        </div>
      </div>

      {/* Draft Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {draftQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <button
                      onClick={() => {
                        setSelectedQuizForSchedule(quiz);
                        setShowScheduleModal(true);
                      }}
                      className="flex items-center gap-2 hover:text-teal-600 transition"
                    >
                      <svg
                        className="w-4 h-4 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {quiz.grade} - {quiz.semester}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Progress</span>
                <span className="text-gray-900 font-semibold">
                  {quiz.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all"
                  style={{ width: `${quiz.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-1">
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{quiz.questions} questions</span>
              </div>
              <div className="flex items-center gap-1">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{quiz.lastEdited}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingDraftId(quiz.id);
                  setActiveMenuItem("create-quiz");
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Continue Editing
              </button>
              <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition">
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => confirmDelete(quiz)}
                className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Button */}
      <div className="mt-6">
        <button
          onClick={() => setActiveMenuItem("create-quiz")}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-teal-500 hover:text-teal-600 font-medium text-sm transition w-full md:w-auto justify-center"
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
          Create New Quiz
        </button>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Schedule Quiz
            </h2>

            {selectedQuizForSchedule && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  {selectedQuizForSchedule.title}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedQuizForSchedule.grade} -{" "}
                  {selectedQuizForSchedule.semester}
                </p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm"
                />
              </div>

              <CustomTimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
              />

              <CustomTimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedQuizForSchedule(null);
                  setScheduleDate("");
                  setStartTime("");
                  setEndTime("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleQuiz}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && quizToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-1">
              Are you sure you want to delete the quiz
            </p>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setQuizToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDraft(quizToDelete.id)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizDraft;
