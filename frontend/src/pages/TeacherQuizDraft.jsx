import React, { useState, useEffect, useMemo } from "react";
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
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [selectedQuizForDueDate, setSelectedQuizForDueDate] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [filterStatus, setFilterStatus] = useState(() => {
    // Read filter from localStorage on initial load
    const savedFilter = localStorage.getItem("quizFilter");
    return savedFilter || "all";
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadDrafts();
  }, []);

  // Auto-refresh every 30 seconds to update quiz statuses in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing quiz statuses...');
      setRefreshTrigger(prev => prev + 1);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Clear the filter from localStorage when component unmounts or filter changes manually
  useEffect(() => {
    return () => {
      localStorage.removeItem("quizFilter");
    };
  }, []);

  // Filter quizzes based on selected status (matching the count logic in buttons)
  // refreshTrigger forces re-evaluation when it changes
  const filteredQuizzes = useMemo(() => {
    return draftQuizzes.filter((quiz) => {
      const now = new Date();

      // Apply status-based filtering
      if (filterStatus === "all") {
        return true;
      }
      
      if (filterStatus === "draft") {
        return quiz.status === "draft" && !quiz.isScheduled;
      }
      
      if (filterStatus === "scheduled") {
        // Show scheduled quizzes that have NOT started yet and have NOT ended
        if (quiz.isScheduled && quiz.scheduleDate && quiz.startTime && quiz.endTime) {
          try {
            const scheduleDate = new Date(quiz.scheduleDate);
            const [startHour, startMinute] = quiz.startTime.split(':').map(Number);
            
            const startDateTime = new Date(scheduleDate);
            startDateTime.setHours(startHour, startMinute, 0, 0);
            
            // Only show if quiz hasn't started yet (upcoming)
            const isUpcoming = now < startDateTime;
            console.log(`Scheduled check: "${quiz.title}" - now: ${now.toLocaleString()}, start: ${startDateTime.toLocaleString()}, isUpcoming: ${isUpcoming}`);
            return isUpcoming;
          } catch (error) {
            console.error('Error in scheduled filter:', error);
            return false;
          }
        }
        return false;
      }
      
      if (filterStatus === "active") {
        // Show quizzes that are currently in their active time window
        // Check ANY quiz with schedule info, regardless of status field
        if (quiz.isScheduled && quiz.scheduleDate && quiz.startTime && quiz.endTime) {
          try {
            const scheduleDate = new Date(quiz.scheduleDate);
            const [startHour, startMinute] = quiz.startTime.split(':').map(Number);
            const [endHour, endMinute] = quiz.endTime.split(':').map(Number);
            
            const startDateTime = new Date(scheduleDate);
            startDateTime.setHours(startHour, startMinute, 0, 0);
            
            const endDateTime = new Date(scheduleDate);
            endDateTime.setHours(endHour, endMinute, 0, 0);
            
            // Handle cross-midnight quizzes: if end time is before start time, add 1 day to end date
            if (endDateTime <= startDateTime) {
              endDateTime.setDate(endDateTime.getDate() + 1);
            }
            
            // Quiz is active if current time is between start and end
            const isActive = now >= startDateTime && now < endDateTime;
            console.log(`Active check: "${quiz.title}" - now: ${now.toLocaleString()}, start: ${startDateTime.toLocaleString()}, end: ${endDateTime.toLocaleString()}, isActive: ${isActive}`);
            return isActive;
          } catch (error) {
            console.error('Error in active filter:', error);
            return false;
          }
        }
        return false;
      }
      
      if (filterStatus === "recent") {
        // Show ONLY quizzes that have ENDED within the last 7 days (168 hours)
        // Must have schedule info and must be past end time
        if (!quiz.isScheduled || !quiz.scheduleDate || !quiz.startTime || !quiz.endTime) return false;
        try {
          const scheduleDate = new Date(quiz.scheduleDate);
          const [startHour, startMinute] = quiz.startTime.split(':').map(Number);
          const [endHour, endMinute] = quiz.endTime.split(':').map(Number);
          
          const startDateTime = new Date(scheduleDate);
          startDateTime.setHours(startHour, startMinute, 0, 0);
          
          const endDateTime = new Date(scheduleDate);
          endDateTime.setHours(endHour, endMinute, 0, 0);
          
          // Handle cross-midnight quizzes: if end time is before start time, add 1 day to end date
          if (endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
          }
          
          // Must be past end time
          const hasEnded = now >= endDateTime;
          if (!hasEnded) {
            return false; // Quiz hasn't ended yet
          }
          
          const hoursSinceEnd = (now - endDateTime) / (1000 * 60 * 60);
          
          // Only show quizzes that ENDED within last 7 days
          const inRange = hoursSinceEnd > 0 && hoursSinceEnd <= 168;
          console.log(`Recent check: "${quiz.title}" - now: ${now.toLocaleString()}, end: ${endDateTime.toLocaleString()}, hasEnded: ${hasEnded}, hoursSinceEnd: ${hoursSinceEnd.toFixed(2)}, inRange: ${inRange}`);
          return inRange;
        } catch (error) {
          console.error('Error in recent filter:', error);
          return false;
        }
      }
      
      return true;
    });
  }, [draftQuizzes, filterStatus, refreshTrigger]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading all quizzes from backend...");
      const response = await teacherQuizService.getMyQuizzes();
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

      const quizzesArray = response.quizzes || response.data || [];
      console.log("📊 Number of quizzes:", quizzesArray.length);

      if (quizzesArray.length === 0) {
        console.log("ℹ️ No quizzes found");
        setDraftQuizzes([]);
        return;
      }

      // Transform backend data to match UI format (include all statuses)
      const transformedDrafts = quizzesArray.map((quiz) => ({
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
        status: quiz.status, // Add status field
        hasStudentAttempts: quiz.hasStudentAttempts || false, // Track if students started
        studentsTaken: quiz.studentsTaken || 0,
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
        dueDate: quiz.dueDate,
        fullData: {
          assignmentTitle: quiz.title,
          subject: quiz.subject,
          dueDate: quiz.dueDate,
          questions: quiz.questions || [],
        },
      }));

      // Remove duplicates based on quiz ID
      const uniqueDrafts = transformedDrafts.filter((quiz, index, self) =>
        index === self.findIndex((q) => q.id === quiz.id)
      );

      console.log("✨ Transformed drafts:", transformedDrafts.length);
      console.log("✅ Unique drafts after deduplication:", uniqueDrafts.length);
      setDraftQuizzes(uniqueDrafts);
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
      console.log("🗑️ Deleting quiz with ID:", id);
      const response = await teacherQuizService.deleteQuiz(id);
      console.log("✅ Delete response:", response);
      // Reload drafts after deletion
      await loadDrafts();
      setShowDeleteModal(false);
      setQuizToDelete(null);
      alert("Quiz deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting quiz:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("Failed to delete quiz: " + (error.response?.data?.message || error.message));
    }
  };

  const confirmDelete = (quiz) => {
    console.log("🗑️ Confirm delete called with quiz:", quiz);
    if (!quiz) {
      console.error("❌ No quiz provided to confirmDelete");
      alert("Error: Quiz not found");
      return;
    }
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleShareQuiz = async () => {
    // Prevent multiple simultaneous submissions
    if (isSharing) {
      console.log('⚠️ Share already in progress, ignoring duplicate click');
      return;
    }

    try {
      setIsSharing(true);
      
      // Share quiz - activate it for students
      await teacherQuizService.scheduleQuiz(quizToShare.id, {
        scheduleDate: quizToShare.scheduleDate,
        startTime: quizToShare.startTime,
        endTime: quizToShare.endTime,
      });

      // Reload drafts to reflect changes
      await loadDrafts();

      alert(
        `✅ Quiz Shared Successfully!\n\nThe quiz "${quizToShare.title}" is now active and visible to students.`
      );

      // Close modal
      setShowShareModal(false);
      setQuizToShare(null);
    } catch (error) {
      console.error("Error sharing quiz:", error);
      alert(
        "❌ Failed to share quiz: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSharing(false);
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

    // Convert times to minutes for proper comparison
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Allow cross-midnight quizzes, but prevent same time
    if (startMinutes === endMinutes) {
      alert("End time must be different from start time");
      return;
    }

    try {
      // Update the quiz with schedule information (but keep as draft)
      await teacherQuizService.updateQuiz(selectedQuizForSchedule.id, {
        scheduleDate,
        startTime,
        endTime,
        dueDate: dueDate || null,
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
      setDueDate("");

      alert(
        "✅ Quiz Scheduled Successfully!\n\nYour quiz has been scheduled. Click the 'Share' button to make it active and visible to students."
      );
    } catch (error) {
      console.error("Error scheduling quiz:", error);
      alert("Failed to schedule quiz");
    }
  };

  const handleDueDateUpdate = async () => {
    if (!dueDate) {
      alert("Please select a due date");
      return;
    }

    try {
      console.log("📅 Updating due date for quiz:", selectedQuizForDueDate.id);
      await teacherQuizService.updateQuiz(selectedQuizForDueDate.id, {
        dueDate: new Date(dueDate).toISOString(),
      });

      // Reload drafts to show updated data
      await loadDrafts();

      // Close modal and reset
      setShowDueDateModal(false);
      setSelectedQuizForDueDate(null);
      setDueDate("");

      alert("✅ Due Date Updated Successfully!");
    } catch (error) {
      console.error("Error updating due date:", error);
      alert("Failed to update due date: " + error.message);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Quizzes</h1>
          <p className="text-gray-600 text-sm">
            Manage your quizzes - drafts, scheduled, and active
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${
            filterStatus === "all"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All ({draftQuizzes.length})
        </button>
        <button
          onClick={() => setFilterStatus("draft")}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${
            filterStatus === "draft"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Drafts (
          {
            draftQuizzes.filter((q) => q.status === "draft" && !q.isScheduled)
              .length
          }
          )
        </button>
        <button
          onClick={() => setFilterStatus("scheduled")}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${
            filterStatus === "scheduled"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Scheduled (
          {
            draftQuizzes.filter((q) => {
              // Count scheduled quizzes that have NOT started yet
              if (q.isScheduled && q.scheduleDate && q.startTime && q.endTime) {
                try {
                  const now = new Date();
                  const scheduleDate = new Date(q.scheduleDate);
                  const [startHour, startMinute] = q.startTime.split(':').map(Number);
                  const [endHour, endMinute] = q.endTime.split(':').map(Number);
                  
                  const startDateTime = new Date(scheduleDate);
                  startDateTime.setHours(startHour, startMinute, 0, 0);
                  
                  const endDateTime = new Date(scheduleDate);
                  endDateTime.setHours(endHour, endMinute, 0, 0);
                  
                  // Only count if quiz hasn't started yet (upcoming)
                  return now < startDateTime;
                } catch (error) {
                  return false;
                }
              }
              return false;
            }).length
          }
          )
        </button>
        <button
          onClick={() => setFilterStatus("active")}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${
            filterStatus === "active"
              ? "bg-green-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Active ({
            draftQuizzes.filter((q) => {
              if (q.isScheduled && q.scheduleDate && q.startTime && q.endTime) {
                try {
                  const now = new Date();
                  const scheduleDate = new Date(q.scheduleDate);
                  const [startHour, startMinute] = q.startTime.split(':').map(Number);
                  const [endHour, endMinute] = q.endTime.split(':').map(Number);
                  
                  const startDateTime = new Date(scheduleDate);
                  startDateTime.setHours(startHour, startMinute, 0, 0);
                  
                  const endDateTime = new Date(scheduleDate);
                  endDateTime.setHours(endHour, endMinute, 0, 0);
                  
                  // Handle cross-midnight quizzes
                  if (endDateTime <= startDateTime) {
                    endDateTime.setDate(endDateTime.getDate() + 1);
                  }
                  
                  return now >= startDateTime && now < endDateTime;
                } catch (error) {
                  return false;
                }
              }
              return false;
            }).length
          })
        </button>
        <button
          onClick={() => setFilterStatus("recent")}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${
            filterStatus === "recent"
              ? "bg-red-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Recent Activity ({
            draftQuizzes.filter((q) => {
              // Only count quizzes that have ENDED within last 7 days
              if (!q.isScheduled || !q.scheduleDate || !q.startTime || !q.endTime) return false;
              try {
                const now = new Date();
                const scheduleDate = new Date(q.scheduleDate);
                const [startHour, startMinute] = q.startTime.split(':').map(Number);
                const [endHour, endMinute] = q.endTime.split(':').map(Number);
                
                const startDateTime = new Date(scheduleDate);
                startDateTime.setHours(startHour, startMinute, 0, 0);
                
                const endDateTime = new Date(scheduleDate);
                endDateTime.setHours(endHour, endMinute, 0, 0);
                
                // Handle cross-midnight quizzes
                if (endDateTime <= startDateTime) {
                  endDateTime.setDate(endDateTime.getDate() + 1);
                }
                
                // Must be past end time
                if (now < endDateTime) {
                  return false; // Quiz hasn't ended yet
                }
                
                const hoursSinceEnd = (now - endDateTime) / (1000 * 60 * 60);
                // Only include if quiz has ended (positive hours) within last 7 days
                return hoursSinceEnd > 0 && hoursSinceEnd <= 168;
              } catch (error) {
                console.error('Error counting recent activity:', error);
                return false;
              }
            }).length
          })
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      )}

      {/* No Quizzes State */}
      {!loading && draftQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No quizzes found. Create your first quiz!
          </p>
        </div>
      )}

      {/* No Filtered Results */}
      {!loading && draftQuizzes.length > 0 && filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No {filterStatus} quizzes found.</p>
        </div>
      )}

      {/* Quiz Cards Grid */}
      {!loading && filteredQuizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className={`bg-white rounded-xl p-6 border-2 shadow-sm hover:shadow-md transition ${
                quiz.status === "active"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      quiz.status === "active"
                        ? "bg-green-100"
                        : "bg-orange-100"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        quiz.status === "active"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {quiz.title}
                      </h3>
                      {quiz.status === "active" && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
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

                {/* Scheduled Date/Time Badge and Due Date Badge - Top Right */}
                <div className="flex flex-col gap-2 items-end">
                  {quiz.isScheduled && quiz.scheduleDate && (
                    <button
                      onClick={() => {
                        setSelectedQuizForSchedule(quiz);
                        const date = new Date(quiz.scheduleDate);
                        const formattedDate = date.toISOString().split("T")[0];
                        setScheduleDate(formattedDate);
                        setStartTime(quiz.startTime || "");
                        setEndTime(quiz.endTime || "");
                        // Load existing due date if available
                        if (quiz.dueDate) {
                          const dueDateObj = new Date(quiz.dueDate);
                          const formattedDueDate = dueDateObj
                            .toISOString()
                            .split("T")[0];
                          setDueDate(formattedDueDate);
                        }
                        setShowScheduleModal(true);
                      }}
                      className="bg-teal-50 border-2 border-teal-500 rounded-lg px-3 py-2 text-right hover:bg-teal-100 transition cursor-pointer relative group"
                    >
                      <div className="text-xs font-semibold text-teal-700 uppercase mb-1 flex items-center justify-end gap-1">
                        Scheduled
                        <svg
                          className="w-3 h-3 opacity-0 group-hover:opacity-100 transition"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </div>
                      <div className="text-sm font-bold text-teal-900">
                        {new Date(quiz.scheduleDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      {quiz.startTime && quiz.endTime && (
                        <div className="text-xs text-teal-700 font-medium mt-1">
                          {formatTime12Hour(quiz.startTime)} -{" "}
                          {formatTime12Hour(quiz.endTime)}
                        </div>
                      )}
                    </button>
                  )}
                  {quiz.dueDate && (
                    <button
                      onClick={() => {
                        setSelectedQuizForSchedule(quiz);
                        // Load schedule date if exists
                        if (quiz.scheduleDate) {
                          const date = new Date(quiz.scheduleDate);
                          const formattedDate = date
                            .toISOString()
                            .split("T")[0];
                          setScheduleDate(formattedDate);
                        }
                        setStartTime(quiz.startTime || "");
                        setEndTime(quiz.endTime || "");
                        // Load existing due date
                        if (quiz.dueDate) {
                          const dueDateObj = new Date(quiz.dueDate);
                          const formattedDueDate = dueDateObj
                            .toISOString()
                            .split("T")[0];
                          setDueDate(formattedDueDate);
                        }
                        setShowScheduleModal(true);
                      }}
                      className="bg-orange-50 border-2 border-orange-500 rounded-lg px-3 py-2 text-right hover:bg-orange-100 transition cursor-pointer relative group"
                    >
                      <div className="text-xs font-semibold text-orange-700 uppercase mb-1 flex items-center justify-end gap-1">
                        Due Date
                        <svg
                          className="w-3 h-3 opacity-0 group-hover:opacity-100 transition"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </div>
                      <div className="text-sm font-bold text-orange-900">
                        {new Date(quiz.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </button>
                  )}
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
                {/* Show Edit button for drafts OR active quizzes without student attempts */}
                {(quiz.status !== "active" ||
                  (quiz.status === "active" && !quiz.hasStudentAttempts)) && (
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
                )}
                {/* Show locked message for active quizzes with student attempts */}
                {quiz.status === "active" && quiz.hasStudentAttempts && (
                  <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium text-sm">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Locked ({quiz.studentsTaken} taken)
                  </div>
                )}
                {/* Show active status for active quizzes without attempts */}
                {quiz.status === "active" && !quiz.hasStudentAttempts && (
                  <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Shared with Students
                  </div>
                )}
                {quiz.status !== "active" && (
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
                )}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm"
                  placeholder="Select due date"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedQuizForSchedule(null);
                  setScheduleDate("");
                  setStartTime("");
                  setEndTime("");
                  setDueDate("");
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-1">
              Are you sure you want to delete the quiz "{quizToDelete.title}"?
            </p>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  console.log("❌ Cancel delete");
                  setShowDeleteModal(false);
                  setQuizToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("✅ Confirming delete for quiz ID:", quizToDelete.id);
                  handleDeleteDraft(quizToDelete.id);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Confirmation Modal */}
      {showShareModal && quizToShare && (() => {
        // Check if quiz is currently active
        const now = new Date();
        const scheduleDate = new Date(quizToShare.scheduleDate);
        const [startHour, startMinute] = quizToShare.startTime.split(':').map(Number);
        const [endHour, endMinute] = quizToShare.endTime.split(':').map(Number);
        
        const startDateTime = new Date(scheduleDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(scheduleDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        const isActive = now >= startDateTime && now < endDateTime;
        const isFuture = now < startDateTime;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive ? "bg-green-100" : "bg-blue-100"
                }`}>
                  <svg
                    className={`w-6 h-6 ${isActive ? "text-green-600" : "text-blue-600"}`}
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
                  {isActive 
                    ? "🎯 This quiz is currently active and students can take it now!"
                    : isFuture
                    ? "📅 This quiz will become visible to students at the scheduled time."
                    : "This quiz will be shared with students."
                  }
                </p>
                <div className={`rounded-lg p-3 border ${
                  isActive 
                    ? "bg-green-50 border-green-200" 
                    : "bg-teal-50 border-teal-200"
                }`}>
                  <div className={`text-sm ${isActive ? "text-green-900" : "text-teal-900"}`}>
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
                    {isActive && (
                      <div className="mt-2 font-semibold text-green-700">
                        ✅ Active Now
                      </div>
                    )}
                    {isFuture && (
                      <div className="mt-2 font-medium text-teal-700">
                        ⏳ Starts {startDateTime.toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric" 
                        })} at {formatTime12Hour(quizToShare.startTime)}
                      </div>
                    )}
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
                disabled={isSharing}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                  isSharing 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSharing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sharing...
                  </>
                ) : (
                  'Share Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Due Date Modal */}
      {showDueDateModal && selectedQuizForDueDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedQuizForDueDate.dueDate
                ? "Change Due Date"
                : "Set Due Date"}
            </h2>

            {selectedQuizForDueDate && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  {selectedQuizForDueDate.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedQuizForDueDate.grade} •{" "}
                  {selectedQuizForDueDate.questions} questions
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:shadow-[0_0_0_3px_rgba(11,107,58,0.06)] focus:border-teal-600 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDueDateModal(false);
                  setSelectedQuizForDueDate(null);
                  setDueDate("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDueDateUpdate}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
              >
                Save Due Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizDraft;
