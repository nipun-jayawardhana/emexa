import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/sidebarorigin';
import Header from '../components/headerorigin';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    setUserName(localStorage.getItem('userName') || 'Admin');
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
    <div className="min-h-screen bg-white">
      {/* Header Component - Fixed */}
      <Header userName={userName} />

      {/* Sidebar Component - Fixed */}
      <Sidebar 
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
      />

      {/* Main Content - Scrollable */}
      <div className="ml-44 pt-14 min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl">
            {/* Page Title */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back! Here's an overview of your academic progress.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Total Quizzes</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalQuizzes || 24}</p>
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Average Score</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.averageScore || 82}%</p>
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Study Time</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.studyTime || 32}h</p>
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Quizzes */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 mb-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900">Upcoming Quizzes</h2>
                <button className="text-green-600 text-xs font-medium hover:underline">View All</button>
              </div>
              <div className="space-y-3">
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
                  <div key={index} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{quiz.title}</h3>
                      <p className="text-xs text-gray-500 mb-1.5">
                        {new Date(quiz.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">{quiz.description}</p>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition whitespace-nowrap">
                      Take Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 mb-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
                <button className="text-green-600 text-xs font-medium hover:underline">View All</button>
              </div>
              <div className="divide-y divide-gray-100">
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
                  <div key={index} className="flex items-center justify-between py-3 first:pt-0">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{activity.type}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {activity.title} • {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {activity.score && (
                      <span className="text-green-600 font-bold text-sm">{activity.score}%</span>
                    )}
                    {activity.status === 'in-progress' && (
                      <span className="text-yellow-600 font-medium text-xs">In Progress</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Analytics */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h2 className="text-base font-bold text-gray-900 mb-4">Personal Analytics</h2>
              <div className="flex flex-col items-center justify-center py-10">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500 text-xs mb-3">Your personal analytics will appear here</p>
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