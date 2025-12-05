import React, { useState, useEffect } from "react";
import teacherQuizService from "../services/teacherQuizService";

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatTime12Hour = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hourNum = parseInt(hours);
  const displayHour =
    hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  const period = hourNum >= 12 ? "PM" : "AM";
  return `${displayHour}:${minutes} ${period}`;
};

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
          <div className="fixed z-50 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64 max-h-[400px]">
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [quizToShare, setQuizToShare] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading drafts from backend...");
      const response = await teacherQuizService.getDrafts();
      console.log("✅ Raw API response:", response);
      console.log("📊 Response type:", typeof response);
      console.log(
        "📋 Response keys:",
        response ? Object.keys(response) : "null/undefined"
      );

      if (!response) {
        console.error("❌ Response is null or undefined");
        setDraftQuizzes([]);
        return;
      }

      // Check if response has success flag
      if (response.success === false) {
        console.error("❌ API returned error:", response.message);
        alert("Error: " + response.message);
        setDraftQuizzes([]);
        return;
      }

      const draftsArray = response.drafts || response.data || [];
      console.log("📊 Number of drafts:", draftsArray.length);

      if (draftsArray.length === 0) {
        console.log("ℹ️ No drafts found");
        setDraftQuizzes([]);
        return;
      }

      // Transform backend data to match UI format
      const transformedDrafts = draftsArray.map((quiz) => ({
        id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        grade: Array.isArray(quiz.gradeLevel)
          ? quiz.gradeLevel[0]
          : quiz.gradeLevel,
        progress: quiz.progress || 0,
        questions: quiz.questions?.length || 0,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
        lastEdited: new Date(quiz.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        createdDate: new Date(quiz.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        isScheduled: quiz.isScheduled,
        scheduleDate: quiz.scheduleDate,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        fullData: {
          assignmentTitle: quiz.title,
          subject: quiz.subject,
          dueDate: quiz.dueDate,
          questions: quiz.questions || [],
        },
      }));

      console.log("✨ Transformed drafts:", transformedDrafts);
      setDraftQuizzes(transformedDrafts);
    } catch (error) {
      console.error("❌ Error loading drafts:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      alert("Failed to load quizzes: " + error.message);
      setDraftQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToQuizzes = () => {
    setActiveMenuItem("quizzes");
  };

  const handleDeleteDraft = async (id) => {
    try {
      await teacherQuizService.deleteQuiz(id);
      // Reload drafts after deletion
      await loadDrafts();
      setShowDeleteModal(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz");
    }
  };

  const confirmDelete = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleShareQuiz = async () => {
    try {
      // Share quiz - activate it for students
      await teacherQuizService.scheduleQuiz(quizToShare.id, {
        scheduleDate: quizToShare.scheduleDate,
        startTime: quizToShare.startTime,
        endTime: quizToShare.endTime,
      });

      alert(`✅ Quiz "${quizToShare.title}" shared with students!`);

      // Reload drafts to reflect changes
      await loadDrafts();

      // Close modal
      setShowShareModal(false);
      setQuizToShare(null);
    } catch (error) {
      console.error("Error sharing quiz:", error);
      alert(
        "❌ Failed to share quiz: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const confirmShare = (quiz) => {
    // Check if quiz has schedule information
    if (!quiz.scheduleDate || !quiz.startTime || !quiz.endTime) {
      alert("⚠️ Please schedule the quiz first before sharing!");
      setSelectedQuizForSchedule(quiz);
      setShowScheduleModal(true);
      return;
    }

    setQuizToShare(quiz);
    setShowShareModal(true);
  };

  const handleScheduleQuiz = async () => {
    if (!scheduleDate || !startTime || !endTime) {
      alert("Please select date, start time, and end time");
      return;
    }

    if (startTime >= endTime) {
      alert("End time must be after start time");
      return;
    }

    try {
      // Update the quiz with schedule information (but keep as draft)
      await teacherQuizService.updateQuiz(selectedQuizForSchedule.id, {
        scheduleDate,
        startTime,
        endTime,
        isScheduled: true,
      });

      // Reload drafts to show updated data
      await loadDrafts();

      // Close modal and reset
      setShowScheduleModal(false);
      setSelectedQuizForSchedule(null);
      setScheduleDate("");
      setStartTime("");
      setEndTime("");

      alert(
        "✅ Quiz scheduled successfully! Click 'Share' to make it visible to students."
      );
    } catch (error) {
      console.error("Error scheduling quiz:", error);
      alert("Failed to schedule quiz");
    }
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      )}

      {/* No Drafts State */}
      {!loading && draftQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No quiz drafts found. Create your first quiz!
          </p>
        </div>
      )}

      {/* Draft Cards Grid */}
      {!loading && draftQuizzes.length > 0 && (
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
                          // Pre-fill existing schedule data if available
                          if (quiz.scheduleDate) {
                            setScheduleDate(
                              new Date(quiz.scheduleDate)
                                .toISOString()
                                .split("T")[0]
                            );
                          }
                          if (quiz.startTime) {
                            setStartTime(quiz.startTime);
                          }
                          if (quiz.endTime) {
                            setEndTime(quiz.endTime);
                          }
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

                {/* Scheduled Date/Time Badge - Top Right */}
                {quiz.isScheduled && quiz.scheduleDate && (
                  <div className="bg-teal-50 border-2 border-teal-500 rounded-lg px-3 py-2 text-right">
                    <div className="text-xs font-semibold text-teal-700 uppercase mb-1">
                      Scheduled
                    </div>
                    <div className="text-sm font-bold text-teal-900">
                      {new Date(quiz.scheduleDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    {quiz.startTime && quiz.endTime && (
                      <div className="text-xs text-teal-700 font-medium mt-1">
                        {formatTime12Hour(quiz.startTime)} -{" "}
                        {formatTime12Hour(quiz.endTime)}
                      </div>
                    )}
                  </div>
                )}
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
              <div className="space-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
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
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-green-600"
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
                  <span className="text-xs">
                    <span className="font-medium text-gray-700">Created:</span>{" "}
                    {quiz.createdDate}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-blue-600"
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
                  <span className="text-xs">
                    <span className="font-medium text-gray-700">Updated:</span>{" "}
                    {quiz.lastEdited}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingDraftId(quiz.id);
                    setActiveMenuItem("create-quiz");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-medium text-sm transition"
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
                <button
                  onClick={() => confirmShare(quiz)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 font-medium text-sm transition"
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
                <button
                  onClick={() => confirmDelete(quiz)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 font-medium text-sm transition"
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
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
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

      {/* Share Confirmation Modal */}
      {showShareModal && quizToShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Share Quiz with Students
                </h2>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-2">
                "{quizToShare.title}"
              </p>
              <p className="text-gray-600 text-sm mb-3">
                This quiz will become visible to students immediately.
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <div className="text-sm text-teal-900">
                  <div className="font-semibold mb-1">Schedule:</div>
                  <div>
                    📅{" "}
                    {new Date(quizToShare.scheduleDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </div>
                  <div>
                    ⏰ {formatTime12Hour(quizToShare.startTime)} -{" "}
                    {formatTime12Hour(quizToShare.endTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setQuizToShare(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleShareQuiz}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Share Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizDraft;
