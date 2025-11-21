import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebarorigin";
import Header from "../components/headerorigin";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    setUserName(localStorage.getItem("userName") || "Admin");
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/user/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header Component - Fixed */}
      <Header userName={userName} />

      {/* Sidebar Component - Fixed */}
      <Sidebar
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
      />

      {/* Main Content - Scrollable */}
      <div className="ml-52 pt-14 min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl">
            {/* Page Title */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-gray-900">
                Student Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back! Here's an overview of your academic progress.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {/* Total Students Card */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Present today</span>
                    <span className="font-semibold text-gray-900">22/24</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Average Progress Card */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      Average Progress
                    </p>
                    <p className="text-3xl font-bold text-gray-900">78%</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Target</span>
                    <span className="font-semibold text-gray-900">80%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Engagement Level Card */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      Engagement Level
                    </p>
                    <p className="text-3xl font-bold text-gray-900">High</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Weekly change</span>
                    <span className="font-semibold text-green-600">+5%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Quizzes */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 mb-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Upcoming Quizzes
                </h2>
                <button className="text-green-600 text-xs font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {(
                  dashboardData?.upcomingQuizzes || [
                    {
                      title: "Matrix",
                      date: "2025-10-20",
                      description:
                        "Prepare for your Matrix quiz by revising matrix operations, determinants, and inverse concepts to strengthen your problem-solving skills.",
                    },
                    {
                      title: "Vectors",
                      date: "2025-10-25",
                      description:
                        "Review vector basics, dot and cross products, and geometric interpretations to get ready for your Vectors quiz.",
                    },
                    {
                      title: "Limits",
                      date: "2025-10-30",
                      description:
                        "Study the fundamentals of limits, continuity, and approaching values to perform well in your Limits quiz.",
                    },
                  ]
                ).map((quiz, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1.5">
                        {new Date(quiz.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {quiz.description}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition whitespace-nowrap"
                    >
                      Take Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 mb-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Recent Activity
                </h2>
                <button className="text-green-600 text-xs font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {(
                  dashboardData?.recentActivity || [
                    {
                      type: "Completed Quiz",
                      title: "Limits Basics",
                      date: "2025-10-10",
                      score: 85,
                      status: "completed",
                    },
                    {
                      type: "Started Quiz",
                      title: "Trigonometry Fundamentals",
                      date: "2025-10-09",
                      status: "in-progress",
                    },
                    {
                      type: "Viewed Results",
                      title: "History Timeline",
                      date: "2025-10-07",
                      score: 78,
                      status: "viewed",
                    },
                  ]
                ).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 first:pt-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {activity.type}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {activity.title} •{" "}
                        {new Date(activity.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {activity.score && (
                      <span className="text-green-600 font-bold text-sm">
                        {activity.score}%
                      </span>
                    )}
                    {activity.status === "in-progress" && (
                      <span className="text-yellow-600 font-medium text-xs">
                        In Progress
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Analytics */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Personal Analytics
              </h2>
              <div className="flex flex-col items-center justify-center py-10">
                <svg
                  className="w-12 h-12 text-gray-300 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-gray-500 text-xs mb-3">
                  Your personal analytics will appear here
                </p>
                <button className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
