import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/sidebarorigin';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    setUserName(localStorage.getItem('userName') || 'Jehan');
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/user/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar 
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        userName={userName}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your academic progress.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-800">{userName}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData?.totalQuizzes || 24}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData?.averageScore || 82}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Study Time</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData?.studyTime || 32}h</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Quizzes */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Quizzes</h2>
              <button className="text-green-600 font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {(dashboardData?.upcomingQuizzes || [
                {
                  title: 'Matrix',
                  date: '2025-10-20',
                  description: 'Prepare for your Matrix quiz by revising matrix operations, determinants, and inverse concepts to strengthen your problem-solving skills.'
                },
                {
                  title: 'Vectors',
                  date: '2025-10-25',
                  description: 'Review vector basics, dot and cross products, and geometric interpretations to get ready for your Vectors quiz.'
                },
                {
                  title: 'Limits',
                  date: '2025-10-30',
                  description: 'Study the fundamentals of limits, continuity, and approaching values to perform well in your Limits quiz.'
                }
              ]).map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(quiz.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500">{quiz.description}</p>
                  </div>
                  <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition">
                    Take Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              <button className="text-green-600 font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {(dashboardData?.recentActivity || [
                {
                  type: 'Completed Quiz',
                  title: 'Limits Basics',
                  date: '2025-10-10',
                  score: 85,
                  status: 'completed'
                },
                {
                  type: 'Started Quiz',
                  title: 'Trigonometry Fundamentals',
                  date: '2025-10-09',
                  status: 'in-progress'
                },
                {
                  type: 'Viewed Results',
                  title: 'History Timeline',
                  date: '2025-10-07',
                  score: 78,
                  status: 'viewed'
                }
              ]).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-800">{activity.type}</p>
                    <p className="text-sm text-gray-600">
                      {activity.title} • {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {activity.score && (
                    <span className="text-green-600 font-bold">{activity.score}%</span>
                  )}
                  {activity.status === 'in-progress' && (
                    <span className="text-yellow-600 font-medium">In Progress</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personal Analytics */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Analytics</h2>
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500 mb-4">Your personal analytics will appear here</p>
              <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;