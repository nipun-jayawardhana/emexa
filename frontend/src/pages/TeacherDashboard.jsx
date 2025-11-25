// frontend/src/pages/TeacherDashboard.jsx
// COMPLETE VERSION with all graphs and student overview

import React, { useState, useEffect } from "react";
import AdminViewWrapper from "../components/AdminViewWrapper";
import Header from "../components/headerorigin";
import Sidebar from "../components/sidebarorigin";

const TeacherDashboard = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");
  const [userName, setUserName] = useState("");

  const adminToken = localStorage.getItem("adminToken");
  const isAdminViewing = localStorage.getItem("adminViewingAs");

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const teacherMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
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
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      id: "quizzes",
      label: "Quizzes",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return <DashboardContent />;
      case "quizzes":
        return <QuizzesContent />;
      case "profile":
        return <ProfileContent />;
      default:
        return <DashboardContent />;
    }
  };

  const PageLayout = ({ children }) => (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen">
      {children}
    </div>
  );

  // Check both adminToken AND isAdminViewing
  if (isAdminViewing && adminToken) {
    return (
      <AdminViewWrapper dashboardType="teacher">
        <PageLayout>{renderContent()}</PageLayout>
      </AdminViewWrapper>
    );
  }

  // Regular teacher view
  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen">
      <Header userName={userName} userRole="teacher" />
      <Sidebar
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        menuItems={teacherMenuItems}
      />
      <div className="ml-52 pt-14">{renderContent()}</div>
    </div>
  );
};

// Dashboard Content Component - COMPLETE WITH ALL GRAPHS
const DashboardContent = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Teacher Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        Monitor and manage your classes and student performance
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Students */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
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
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">
                Total Students
              </p>
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

        {/* Average Progress */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
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
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">
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

        {/* Engagement Level */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
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
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">
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

      {/* Class Progress Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Class Progress
        </h2>
        <div className="relative h-80 pl-8 pr-4 pt-2 pb-16">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-2 bottom-16 w-8 flex flex-col justify-between text-xs text-gray-600">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {/* Chart area with border */}
          <div className="absolute left-8 right-4 top-2 bottom-16 border-l border-b border-gray-400">
            {/* Horizontal dotted grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-dotted border-gray-300"></div>
              <div className="border-t border-dotted border-gray-300"></div>
              <div className="border-t border-dotted border-gray-300"></div>
              <div className="border-t border-dotted border-gray-300"></div>
              <div className="border-t border-dotted border-gray-300"></div>
            </div>

            {/* Vertical dotted grid lines */}
            <div className="absolute inset-0 flex justify-around pointer-events-none">
              <div className="border-l border-dotted border-gray-300 h-full"></div>
              <div className="border-l border-dotted border-gray-300 h-full"></div>
              <div className="border-l border-dotted border-gray-300 h-full"></div>
              <div className="border-l border-dotted border-gray-300 h-full"></div>
            </div>

            {/* Bars container */}
            <div className="absolute inset-0 flex items-end justify-around px-8">
              {[
                { label: "Week 1", completed: 65, target: 82 },
                { label: "Week 2", completed: 72, target: 80 },
                { label: "Week 3", completed: 80, target: 82 },
                { label: "Week 4", completed: 88, target: 80 },
              ].map((week, index) => (
                <div key={index} className="flex items-end gap-1.5 h-full">
                  <div
                    className="w-10 bg-teal-700 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${week.completed}%` }}
                  ></div>
                  <div
                    className="w-10 bg-green-300 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${week.target}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="absolute left-8 right-4 bottom-0 flex justify-around text-sm text-gray-700 font-medium">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-8 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-700 rounded-sm"></div>
            <span className="text-sm text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
            <span className="text-sm text-gray-700">Target</span>
          </div>
        </div>
      </div>

      {/* Engagement Trend & Emotional State - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Engagement Trend Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Engagement Trend
          </h2>
          <div className="relative h-64 pl-8 pr-4 pt-2 pb-12">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-2 bottom-12 w-8 flex flex-col justify-between text-xs text-gray-600">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            {/* Chart area with border */}
            <div className="absolute left-8 right-4 top-2 bottom-12 border-l border-b border-gray-400">
              {/* Horizontal dotted grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-dotted border-gray-300"></div>
                <div className="border-t border-dotted border-gray-300"></div>
                <div className="border-t border-dotted border-gray-300"></div>
                <div className="border-t border-dotted border-gray-300"></div>
                <div className="border-t border-dotted border-gray-300"></div>
              </div>

              {/* Vertical dotted grid lines */}
              <div className="absolute inset-0 flex justify-around pointer-events-none">
                <div className="border-l border-dotted border-gray-300 h-full"></div>
                <div className="border-l border-dotted border-gray-300 h-full"></div>
                <div className="border-l border-dotted border-gray-300 h-full"></div>
                <div className="border-l border-dotted border-gray-300 h-full"></div>
              </div>

              {/* Line chart */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Fill area under the line */}
                <polygon
                  points="0,35 20,30 40,25 60,15 80,20 100,10 100,100 0,100"
                  fill="#0d9488"
                  opacity="0.1"
                />
                {/* Line path */}
                <polyline
                  points="0,35 20,30 40,25 60,15 80,20 100,10"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Data points overlay */}
              <div className="absolute inset-0">
                <div
                  className="absolute w-2 h-2 bg-teal-700 rounded-full"
                  style={{
                    left: "0%",
                    top: "35%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
                <div
                  className="absolute w-2 h-2 bg-teal-700 rounded-full"
                  style={{
                    left: "20%",
                    top: "30%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
                <div
                  className="absolute w-2 h-2 bg-teal-700 rounded-full"
                  style={{
                    left: "40%",
                    top: "25%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
                <div
                  className="absolute w-2 h-2 bg-teal-700 rounded-full"
                  style={{
                    left: "60%",
                    top: "15%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
                <div
                  className="absolute w-2 h-2 bg-teal-700 rounded-full"
                  style={{
                    left: "80%",
                    top: "20%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
                <div
                  className="absolute w-2 h-2 bg-teal-700 rounded-full"
                  style={{
                    left: "100%",
                    top: "10%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              </div>
            </div>

            {/* X-axis labels */}
            <div className="absolute left-8 right-4 bottom-0 flex justify-around text-xs text-gray-600">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center items-center mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-700 rounded-full"></div>
              <span className="text-xs text-gray-700">Engagement %</span>
            </div>
          </div>
        </div>

        {/* Emotional State */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Emotional State
          </h2>
          <div className="flex justify-center items-center h-64">
            <svg className="w-64 h-64" viewBox="0 0 200 200">
              {/* Happy - 40% (Dark Teal - Top Right) */}
              <path
                d="M 100,100 L 100,0 A 100,100 0 0,1 200,100 Z"
                fill="#0f766e"
              />
              {/* Confused - 30% (Light Green - Right) */}
              <path
                d="M 100,100 L 200,100 A 100,100 0 0,1 170.7,170.7 Z"
                fill="#86efac"
              />
              {/* Frustrated - 20% (Teal - Bottom) */}
              <path
                d="M 100,100 L 170.7,170.7 A 100,100 0 0,1 29.3,170.7 Z"
                fill="#14b8a6"
              />
              {/* Neutral - 10% (Yellow - Left) */}
              <path
                d="M 100,100 L 29.3,170.7 A 100,100 0 0,1 100,0 Z"
                fill="#fde047"
              />
            </svg>
          </div>
          <div className="flex justify-center flex-wrap gap-3 mt-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-teal-700 rounded-sm"></div>
              <span className="text-xs text-gray-600">Happy 40%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <span className="text-xs text-gray-600">Confused 30%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-teal-500 rounded-sm"></div>
              <span className="text-xs text-gray-600">Frustrated 20%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-300 rounded-sm"></div>
              <span className="text-xs text-gray-600">Neutral 10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Overview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Student Overview
          </h2>
          <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "Emma Thompson",
              engagement: "High",
              progress: 92,
              image: "👩",
            },
            {
              name: "Liam Johnson",
              engagement: "Medium",
              progress: 88,
              image: "👨",
            },
            {
              name: "Olivia Davis",
              engagement: "High",
              progress: 95,
              image: "👩",
            },
            {
              name: "Noah Williams",
              engagement: "Medium",
              progress: 85,
              image: "👨",
            },
          ].map((student, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xl shrink-0">
                  {student.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-600">Engagement:</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {student.engagement}
                    </span>
                    <svg
                      className="w-3 h-3 text-green-600"
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
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">
                    {student.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Quizzes Content Component
const QuizzesContent = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Quizzes</h1>
      <p className="text-gray-600 mb-6">
        Create and manage quizzes for your students
      </p>
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Quizzes
          </h2>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
            + Create Quiz
          </button>
        </div>
        <div className="space-y-4">
          {[
            {
              title: "Mathematics Final Exam",
              students: 24,
              completed: 18,
              date: "2024-03-15",
            },
            {
              title: "Physics Quiz 3",
              students: 28,
              completed: 28,
              date: "2024-03-10",
            },
            {
              title: "Chemistry Lab Test",
              students: 22,
              completed: 15,
              date: "2024-03-08",
            },
          ].map((quiz, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-500">Due: {quiz.date}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    quiz.completed === quiz.students
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {quiz.completed}/{quiz.students} Completed
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition">
                  View Results
                </button>
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Profile Content Component
const ProfileContent = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
      <p className="text-gray-600 mb-6">
        Manage your account settings and preferences
      </p>
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <p className="text-gray-600">Profile settings coming soon...</p>
      </div>
    </div>
  );
};

export default TeacherDashboard;
