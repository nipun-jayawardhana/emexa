import React, { useState, useEffect, useRef, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import camera from "../lib/camera";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import teacherQuizService from "../services/teacherQuizService";
import AdminViewWrapper from "../components/AdminViewWrapper";
// cspell:disable-next-line sidebarorigin
import Sidebar from "../components/sidebarorigin";
// cspell:disable-next-line headerorigin
import Header from "../components/headerorigin";

// Helper function to convert 24-hour time to 12-hour AM/PM format
// eslint-disable-next-line no-unused-vars
const formatTime12Hour = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hourNum = parseInt(hours);
  const displayHour =
    hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  const period = hourNum >= 12 ? "PM" : "AM";
  return `${displayHour}:${minutes} ${period}`;
};

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [userEmail, setUserEmail] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");
  // eslint-disable-next-line no-unused-vars
  const [sharedQuizzes, setSharedQuizzes] = useState([]);
  const [highlightedQuizId, setHighlightedQuizId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [showAllQuizzes, setShowAllQuizzes] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const quizRefs = useRef({});
  const adminToken = localStorage.getItem("adminToken");
  const isAdminViewing = localStorage.getItem("adminViewingAs");
  // eslint-disable-next-line no-unused-vars
  const viewingUserId = localStorage.getItem("adminViewingUserId");

  // Sync activeMenuItem with current location
  useEffect(() => {
    const pathToMenuItem = {
      "/dashboard": "dashboard",
      "/wellness-centre": "wellness",
      "/profile": "profile",
    };
    const menuItem = pathToMenuItem[location.pathname] || "dashboard";
    setActiveMenuItem(menuItem);
  }, [location.pathname]);

  // Handle highlighted quiz from notification
  useEffect(() => {
    console.log("ðŸŒ Full URL:", window.location.href);
    console.log("ðŸŒ Pathname:", location.pathname);
    console.log("ðŸŒ Search:", location.search);
    const quizId = searchParams.get("highlightQuiz");
    console.log("ðŸŒ URL Search Params:", searchParams.toString());
    console.log("ðŸŽ¯ highlightQuiz parameter:", quizId);
    if (quizId && !loading) {
      console.log("âœ¨ Setting highlighted quiz ID to:", quizId);
      setHighlightedQuizId(quizId);
    } else if (!quizId) {
      console.log("âš ï¸ No highlightQuiz parameter in URL");
    } else if (loading) {
      console.log("â³ Still loading, will try again...");
    }
  }, [searchParams, loading, location]);

  // Scroll to highlighted quiz when it's rendered
  useEffect(() => {
    console.log(
      "ðŸ”” Scroll effect running. highlightedQuizId:",
      highlightedQuizId,
      "loading:",
      loading
    );

    if (!highlightedQuizId || loading) {
      console.log("â¹ï¸ Exiting scroll effect early");
      return;
    }

    console.log("ðŸ“ Scroll effect triggered for quiz:", highlightedQuizId);

    // Use requestAnimationFrame for better timing
    const attemptScroll = () => {
      requestAnimationFrame(() => {
        const allRefKeys = Object.keys(quizRefs.current);
        console.log("ðŸ”‘ All available quiz refs:", allRefKeys);
        console.log("ðŸ”‘ Total refs registered:", allRefKeys.length);

        // Try to find the element
        let quizElement = quizRefs.current[highlightedQuizId];

        // If not found, try string conversion
        if (!quizElement) {
          const stringId = String(highlightedQuizId);
          quizElement = quizRefs.current[stringId];
          console.log(
            "ðŸ”„ Tried string conversion:",
            stringId,
            "Found:",
            !!quizElement
          );
        }

        console.log("ðŸ” Quiz element found:", !!quizElement);

        if (quizElement) {
          console.log("âœ… Scrolling NOW to quiz!");
          quizElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        } else {
          console.log("âŒ No element found for ID:", highlightedQuizId);
          console.log(
            "ðŸ’¡ Hint: Check if the quiz ID in notification matches any of these:",
            allRefKeys
          );
        }
      });
    };

    // Try multiple times to ensure we catch the element
    const timer1 = setTimeout(attemptScroll, 100);
    const timer2 = setTimeout(attemptScroll, 500);
    const timer3 = setTimeout(attemptScroll, 1000);
    const timer4 = setTimeout(attemptScroll, 1500);

    // Clear highlight after 5 seconds
    const clearTimer = setTimeout(() => {
      console.log("â° Clearing highlight after 5 seconds");
      setHighlightedQuizId(null);
      setSearchParams({});
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(clearTimer);
    };
  }, [highlightedQuizId, loading, setSearchParams]);

  const fetchSharedQuizzes = async () => {
    try {
      const response = await teacherQuizService.getSharedQuizzes();
      console.log("ðŸ“š Fetched shared quizzes:", response);

      if (response.quizzes && response.quizzes.length > 0) {
        setSharedQuizzes(response.quizzes);
      }
    } catch (error) {
      console.error("âŒ Error fetching shared quizzes:", error);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("âŒ No token for dashboard fetch");
        return;
      }

      console.log("ðŸ“Š Fetching dashboard data...");

      const response = await axios.get(
        "http://localhost:5000/api/users/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("âœ… Dashboard data fetched:", response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error("âŒ Error fetching dashboard data:", error);

      if (error.response?.status === 401) {
        console.log("âš ï¸ Unauthorized, clearing tokens");

        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ============================================
  // CRITICAL: Check if admin is viewing a specific student
  // ============================================
  useEffect(() => {
    const initializeDashboard = async () => {
      const isAdminViewingStudent = localStorage.getItem("adminViewingAs");
      const adminToken = localStorage.getItem("adminToken");
      const viewingUserId = localStorage.getItem("adminViewingUserId");
      const viewingUserName = localStorage.getItem("adminViewingUserName");
      const viewingUserEmail = localStorage.getItem("adminViewingUserEmail");

      console.log("ðŸ” Student Dashboard Initialize:", {
        isAdminViewingStudent,
        viewingUserId,
        viewingUserName,
        hasAdminToken: !!adminToken,
      });

      // If admin is viewing a specific student
      if (isAdminViewingStudent === "student" && adminToken && viewingUserId) {
        console.log("ðŸ‘¤ Admin viewing student:", viewingUserName);

        try {
          // Fetch the specific student's dashboard data
          const response = await axios.get(
            `http://localhost:5000/api/users/${viewingUserId}/dashboard`,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          );

          const studentData = response.data;
          console.log(
            "âœ… Fetched student dashboard data for admin view:",
            studentData
          );

          // Set the viewed student's information
          setUserName(studentData?.name || viewingUserName || "Student");
          setUserEmail(studentData?.email || viewingUserEmail || "");

          // Store for Header component
          localStorage.setItem("displayUserName", studentData?.name || "");
          localStorage.setItem("displayUserEmail", studentData?.email || "");

          // Set dashboard data safely
          if (studentData) {
            setDashboardData({
              name: studentData.name,
              email: studentData.email,
              totalQuizzes: studentData.totalQuizzes ?? 0,
              averageScore: studentData.averageScore ?? 0,
              studyTime: studentData.studyTime ?? 0,
              upcomingQuizzes: studentData.upcomingQuizzes ?? [],
              recentActivity: studentData.recentActivity ?? [],
            });
          }

          setLoading(false);
        } catch (error) {
          console.error("âŒ Error fetching student data for admin:", error);
          alert("Failed to load student data. Returning to user management.");

          // Clear viewing flags
          localStorage.removeItem("adminViewingUserId");
          localStorage.removeItem("adminViewingUserName");
          localStorage.removeItem("adminViewingUserEmail");
          localStorage.removeItem("adminViewingAs");
          localStorage.removeItem("displayUserName");
          localStorage.removeItem("displayUserEmail");

          window.location.href = "/admin/user-management";
        }
      } else {
        // Normal student viewing their own dashboard
        console.log("ðŸ‘¤ Student viewing own dashboard");

        const token = localStorage.getItem("token");
        const storedUserName = localStorage.getItem("userName");
        const storedUserEmail = localStorage.getItem("userEmail");

        if (!token) {
          console.log("âŒ No token found, redirecting to login");
          navigate("/login");
          return;
        }

        setUserName(storedUserName || "Student");
        setUserEmail(storedUserEmail || "");

        // Fetch their own dashboard data
        await fetchDashboardData();
      }

      // Fetch shared quizzes for both cases
      await fetchSharedQuizzes();
    };

    initializeDashboard();
  }, [navigate]);

  // Cleanup when leaving dashboard
  useEffect(() => {
    return () => {
      const currentPath = window.location.pathname;
      // Only clear if navigating back to user management
      if (
        currentPath === "/admin/user-management" ||
        currentPath.includes("/admin")
      ) {
        console.log("ðŸ§¹ Cleaning up admin viewing flags");
        localStorage.removeItem("adminViewingUserId");
        localStorage.removeItem("adminViewingUserName");
        localStorage.removeItem("adminViewingUserEmail");
        localStorage.removeItem("adminViewingUserRole");
        localStorage.removeItem("adminViewingAs");
        localStorage.removeItem("adminViewingUser");
        localStorage.removeItem("displayUserName");
        localStorage.removeItem("displayUserEmail");
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const totalQuizzes = dashboardData?.totalQuizzes || 0;
  const completedQuizzes = totalQuizzes;
  // eslint-disable-next-line no-unused-vars
  const completionPercentage =
    totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

  // Calculate average score
  // eslint-disable-next-line no-unused-vars
  const averageScore = dashboardData?.averageScore || 0;

  // Calculate study time percentage (target = 40 hours)
  const studyTime = dashboardData?.studyTime || 0;
  const studyTimeTarget = 40;
  // eslint-disable-next-line no-unused-vars
  const studyTimePercentage = Math.min(
    Math.round((studyTime / studyTimeTarget) * 100),
    100
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl">
          {/* Back Button */}
          {window.history.length > 1 && (
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
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
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          {/* Admin viewing banner */}
          {isAdminViewing && adminToken && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Admin View Mode - Viewing: {userName || "Student"}
                  </p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    You are viewing this student's dashboard as an administrator
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard UI continues here */}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
