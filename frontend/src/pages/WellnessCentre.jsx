import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/headerorigin";
import Sidebar from "../components/sidebarorigin";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const WellnessCentre = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState("wellness");
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [userName, setUserName] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName") || sessionStorage.getItem("userName");
    setUserName(storedUserName || "Student");
  }, []);

  // Ensure activeMenuItem is always 'wellness' when on wellness page
  useEffect(() => {
    if (location.pathname === '/wellness-centre') {
      setActiveMenuItem('wellness');
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      onClick: () => navigate("/dashboard"),
    },
    {
      id: "wellness",
      label: "Wellness Centre",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => navigate("/profile"),
    },
  ];

  const moods = [
    { 
      emoji: "😢", 
      label: "Very Sad", 
      color: "hover:bg-blue-50",
      bgColor: "bg-blue-50",
      ringColor: "ring-blue-500",
      message: "I'm sorry you're feeling this way. Remember, it's okay to have difficult days. Consider talking to someone you trust or taking a short break to breathe.",
      messageColor: "bg-blue-100 text-blue-800 border-blue-300"
    },
    { 
      emoji: "😐", 
      label: "Sad", 
      color: "hover:bg-orange-50",
      bgColor: "bg-orange-50",
      ringColor: "ring-orange-500",
      message: "Feeling down is normal. Try doing something small that usually makes you happy, or reach out to a friend for support. You're not alone.",
      messageColor: "bg-orange-100 text-orange-800 border-orange-300"
    },
    { 
      emoji: "🙂", 
      label: "Neutral", 
      color: "hover:bg-blue-50",
      bgColor: "bg-gray-50",
      ringColor: "ring-gray-500",
      message: "You're doing okay today. That's perfectly fine! Some days are just steady, and that's part of life's balance. Keep going!",
      messageColor: "bg-gray-100 text-gray-800 border-gray-300"
    },
    { 
      emoji: "😊", 
      label: "Happy", 
      color: "hover:bg-green-50",
      bgColor: "bg-green-50",
      ringColor: "ring-green-500",
      message: "That's wonderful! I'm glad you're feeling good today. Keep this positive energy and maybe share it with someone else!",
      messageColor: "bg-green-100 text-green-800 border-green-300"
    },
    { 
      emoji: "😄", 
      label: "Very Happy", 
      color: "hover:bg-purple-50",
      bgColor: "bg-purple-50",
      ringColor: "ring-purple-500",
      message: "Amazing! Your positive energy is contagious! Keep celebrating the good moments and remember this feeling. You're doing great!",
      messageColor: "bg-purple-100 text-purple-800 border-purple-300"
    },
  ];

  const handleMoodSelect = async (index) => {
    setSelectedMood(index);
    setShowMessage(true);
    
    // Save mood
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/wellness/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: moods[index].label,
          emoji: moods[index].emoji,
        }),
      });
    } catch (error) {
      console.error("Error saving mood:", error);
    }

    // Get AI recommendation
    setLoadingRecommendation(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/wellness/recommendation`,
        {
          mood: moods[index].label,
          emoji: moods[index].emoji,
          timeOfDay: new Date().getHours()
        },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      setAiRecommendation(response.data.recommendation || moods[index].message);
    } catch (error) {
      console.error("Error:", error);
      setAiRecommendation(moods[index].message);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      <Header userName={userName} />

      <Sidebar
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
      />

      {/* Main Content */}
      <div className="ml-52 pt-14 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Wellness Dashboard
        </h1>

        {/* Mood Tracker */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            How are you feeling today?
          </h2>
          <div className="flex justify-center gap-6">
            {moods.map((mood, index) => (
              <button
                key={index}
                onClick={() => handleMoodSelect(index)}
                className={`flex flex-col items-center p-4 rounded-lg transition-all transform hover:scale-110 ${
                  selectedMood === index
                    ? `${mood.bgColor} ring-2 ${mood.ringColor} scale-110`
                    : mood.color
                }`}
                title={`Click if you're feeling ${mood.label.toLowerCase()}`}
              >
                <span className="text-5xl mb-2">{mood.emoji}</span>
              </button>
            ))}
          </div>

          {/* Mood Message - Shows after selection */}
          {showMessage && selectedMood !== null && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${moods[selectedMood].messageColor}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{moods[selectedMood].emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    You're feeling {moods[selectedMood].label}
                  </h3>
                  {loadingRecommendation ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <p className="text-sm">Getting personalized tip...</p>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">
                      {aiRecommendation || moods[selectedMood].message}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowMessage(false)}
                  className="text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wellness Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Stress Management */}
          <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl shadow-sm p-6 border border-pink-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Stress Management
                </h3>
                <p className="text-gray-700 text-sm">
                  Try deep breathing for 2 minutes to reduce stress
                </p>
              </div>
            </div>
          </div>

          {/* Motivation Boost */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-6 border border-yellow-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Motivation Boost
                </h3>
                <p className="text-gray-700 text-sm">
                  You did great last week on Math! Keep it up!
                </p>
              </div>
            </div>
          </div>

          {/* Break Time */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-sm p-6 border border-cyan-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Break Time
                </h3>
                <p className="text-gray-700 text-sm">
                  You've been working for 50 minutes. Time for a stretch!
                </p>
              </div>
            </div>
          </div>

          {/* SEL Exercise */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-purple-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  SEL Exercise
                </h3>
                <p className="text-gray-700 text-sm">
                  Today's focus: Practice gratitude journaling
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Tip */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-xl font-semibold mb-3">Wellness Tip</h3>
          <p className="text-lg leading-relaxed">
            "Small steps every day lead to big changes over time. Be patient with yourself."
          </p>
        </div>
      </div>

      {/* Add custom animation style */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WellnessCentre;