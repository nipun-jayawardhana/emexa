import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/sidebar";

export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#C8F1D9] p-4 hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        
        {/* Top Navbar */}
        <Navbar />

        {/* Title */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here’s an overview of your academic progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          
          <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-500 flex items-center justify-center rounded-lg text-xl font-bold">
              📘
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Quizzes</p>
              <h2 className="text-2xl font-semibold">24</h2>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 flex items-center justify-center rounded-lg text-xl font-bold">
              ⭐
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Score</p>
              <h2 className="text-2xl font-semibold">82%</h2>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-500 flex items-center justify-center rounded-lg text-xl font-bold">
              ⏳
            </div>
            <div>
              <p className="text-gray-500 text-sm">Study Time</p>
              <h2 className="text-2xl font-semibold">32h</h2>
            </div>
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white mt-8 p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Quizzes</h2>
            <button className="text-green-600 font-semibold">View All</button>
          </div>

          <div className="space-y-4">

            {/* Quiz 1 */}
            <div className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Matrix</h3>
                <p className="text-gray-500 text-sm">Oct 20, 2025</p>
                <p className="text-gray-600 mt-1 text-sm">
                  Prepare for your Matrix quiz by revising matrix operations…
                </p>
              </div>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Take Quiz
              </button>
            </div>

            {/* Quiz 2 */}
            <div className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Vectors</h3>
                <p className="text-gray-500 text-sm">Oct 25, 2025</p>
                <p className="text-gray-600 mt-1 text-sm">
                  Review vector basics, dot and cross products…
                </p>
              </div>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Take Quiz
              </button>
            </div>

            {/* Quiz 3 */}
            <div className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Limits</h3>
                <p className="text-gray-500 text-sm">Oct 30, 2025</p>
                <p className="text-gray-600 mt-1 text-sm">
                  Study the fundamentals of limits, continuity…
                </p>
              </div>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Take Quiz
              </button>
            </div>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white mt-8 p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <button className="text-green-600 font-semibold">View All</button>
          </div>

          <div className="space-y-4">

            {/* Completed */}
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Completed Quiz</p>
                <p className="text-gray-500 text-sm">Limits Basics • Oct 10, 2025</p>
              </div>
              <p className="text-green-600 font-semibold">85%</p>
            </div>

            {/* In Progress */}
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Started Quiz</p>
                <p className="text-gray-500 text-sm">Trigonometry • Oct 9, 2025</p>
              </div>
              <p className="text-yellow-500 font-semibold">In Progress</p>
            </div>

            {/* Viewed Results */}
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Viewed Results</p>
                <p className="text-gray-500 text-sm">History Timeline • Oct 7, 2025</p>
              </div>
              <p className="text-blue-500 font-semibold">78%</p>
            </div>

          </div>
        </div>

        {/* Personal Analytics */}
        <div className="bg-white mt-8 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Personal Analytics</h2>
          <div className="h-32 flex items-center justify-center text-gray-400">
            (Analytics chart placeholder)
          </div>
          <div className="text-center mt-4">
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg">
              View Analytics
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
