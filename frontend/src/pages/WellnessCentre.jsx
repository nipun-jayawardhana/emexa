import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, TrendingUp, MessageCircle, Brain, Heart, Activity, Calendar, Target, Zap } from 'lucide-react';
import Header from "../components/headerorigin";
import Sidebar from "../components/sidebarorigin";

const WellnessCentre = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("wellness");
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [userName, setUserName] = useState("Student");
  const [aiAdvice, setAiAdvice] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [dailyTip, setDailyTip] = useState("Loading your daily wellness tip...");
  const [moodHistory, setMoodHistory] = useState([]);
  const [weeklyInsights, setWeeklyInsights] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [activeTab, setActiveTab] = useState("mood");
  const [analyzingPattern, setAnalyzingPattern] = useState(false);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName") || sessionStorage.getItem("userName");
    setUserName(storedUserName || "Student");
    
    fetchDailyTip();
    loadMoodHistory();
  }, []);

  const fetchDailyTip = async () => {
    setDailyTip("Loading...");
    
    // Replace this with your actual API call:
    // const response = await fetch('/api/wellness-ai/daily-tip', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // const data = await response.json();
    // setDailyTip(data.tip);
    
    setTimeout(() => {
      const tips = [
        "Small steps every day lead to big changes over time. Be patient with yourself.",
        "Take a 5-minute break every hour to stretch and breathe deeply.",
        "Celebrate your progress, no matter how small. You're doing great!",
        "Remember: it's okay to ask for help. Reaching out is a sign of strength.",
        "Practice the 5-4-3-2-1 grounding technique when you feel overwhelmed."
      ];
      setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 1000);
  };

  const loadMoodHistory = async () => {
    // Replace this with your actual API call to fetch mood history:
    // const response = await fetch('/api/wellness/mood-history', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // const data = await response.json();
    // setMoodHistory(data.moodHistory);
    
    // DEMO DATA - Replace with actual API response
    const demoHistory = [
      { date: "Mon", mood: "Happy", emoji: "😊", value: 4 },
      { date: "Tue", mood: "Neutral", emoji: "🙂", value: 3 },
      { date: "Wed", mood: "Happy", emoji: "😊", value: 4 },
      { date: "Thu", mood: "Very Happy", emoji: "😄", value: 5 },
      { date: "Fri", mood: "Happy", emoji: "😊", value: 4 },
      { date: "Sat", mood: "Sad", emoji: "😐", value: 2 },
      { date: "Sun", mood: "Neutral", emoji: "🙂", value: 3 }
    ];
    setMoodHistory(demoHistory);
  };

  const analyzeWeeklyPattern = async () => {
    if (moodHistory.length === 0) {
      alert("No mood history available to analyze");
      return;
    }
    
    setAnalyzingPattern(true);
    setWeeklyInsights(null);
    
    // Replace this with your actual API call:
    // const response = await fetch('/api/wellness-ai/analyze-patterns', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`
    //   },
    //   body: JSON.stringify({ moodHistory })
    // });
    // const data = await response.json();
    // setWeeklyInsights(data);
    
    setTimeout(() => {
      // Calculate positive mood count
      const positiveMoods = moodHistory.filter(m => 
        m.mood === "Happy" || m.mood === "Very Happy"
      ).length;
      
      setWeeklyInsights({
        trend: positiveMoods >= 4 ? "positive" : "neutral",
        message: `You've had mostly positive moods this week! Your emotional wellbeing shows a healthy pattern with ${positiveMoods} out of ${moodHistory.length} days being happy or very happy.`,
        suggestion: "Keep up the good work! To maintain this positive trend, try to identify what made you happy on those days and do more of it.",
        strength: "Your resilience is showing - even on tougher days, you bounced back quickly."
      });
      setAnalyzingPattern(false);
    }, 1500);
  };

  const moods = [
    { 
      emoji: "😢", 
      label: "Very Sad", 
      color: "hover:bg-blue-50",
      bgColor: "bg-blue-50",
      ringColor: "ring-blue-500",
      messageColor: "bg-blue-100 text-blue-800 border-blue-300",
      value: 1
    },
    { 
      emoji: "😐", 
      label: "Sad", 
      color: "hover:bg-orange-50",
      bgColor: "bg-orange-50",
      ringColor: "ring-orange-500",
      messageColor: "bg-orange-100 text-orange-800 border-orange-300",
      value: 2
    },
    { 
      emoji: "🙂", 
      label: "Neutral", 
      color: "hover:bg-blue-50",
      bgColor: "bg-gray-50",
      ringColor: "ring-gray-500",
      messageColor: "bg-gray-100 text-gray-800 border-gray-300",
      value: 3
    },
    { 
      emoji: "😊", 
      label: "Happy", 
      color: "hover:bg-green-50",
      bgColor: "bg-green-50",
      ringColor: "ring-green-500",
      messageColor: "bg-green-100 text-green-800 border-green-300",
      value: 4
    },
    { 
      emoji: "😄", 
      label: "Very Happy", 
      color: "hover:bg-purple-50",
      bgColor: "bg-purple-50",
      ringColor: "ring-purple-500",
      messageColor: "bg-purple-100 text-purple-800 border-purple-300",
      value: 5
    },
  ];

  const handleMoodSelect = async (index) => {
    setSelectedMood(index);
    setShowMessage(true);
    setLoadingAI(true);
    setAiAdvice(null);

    const selectedMoodData = moods[index];

    // Save mood to backend
    // const token = localStorage.getItem("token");
    // await fetch("http://localhost:5000/api/wellness/mood", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({
    //     mood: selectedMoodData.label,
    //     emoji: selectedMoodData.emoji,
    //   }),
    // });

    // Get AI advice
    // const response = await fetch('/api/wellness-ai/mood-advice', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`
    //   },
    //   body: JSON.stringify({
    //     mood: selectedMoodData.label,
    //     emoji: selectedMoodData.emoji,
    //     recentMoods: moodHistory.slice(-3).map(m => m.mood)
    //   })
    // });
    // const data = await response.json();
    // setAiAdvice(data.advice);

    // Demo response
    setTimeout(() => {
      const responses = {
        "Very Sad": "I'm here with you. Remember that difficult feelings pass, and it's brave to acknowledge them. Try taking a few deep breaths, and consider reaching out to someone you trust. You don't have to face this alone.",
        "Sad": "It's okay to feel down sometimes. Be gentle with yourself today. Maybe try doing something small that usually brings you comfort, like listening to your favorite music or taking a short walk.",
        "Neutral": "You're doing okay, and that's perfectly fine! Some days are just steady, and that's part of life's balance. Keep taking care of yourself with small acts of kindness.",
        "Happy": "I'm glad you're feeling good today! This positive energy is wonderful. Keep it going by sharing a smile with someone or doing something you enjoy.",
        "Very Happy": "Your positive energy is contagious! This is wonderful. Take a moment to appreciate what brought you this joy, and remember this feeling when things get tough."
      };
      setAiAdvice(responses[selectedMoodData.label]);
      setLoadingAI(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput("");
    setLoadingChat(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/wellness-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: chatInput,
          history: chatMessages
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = { 
          role: "assistant", 
          content: data.response
        };
        setChatMessages([...newMessages, aiMessage]);
      } else {
        // Fallback response if API fails
        const aiMessage = { 
          role: "assistant", 
          content: "I'm here to support you. Could you tell me more about what you're experiencing?"
        };
        setChatMessages([...newMessages, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback response on error
      const aiMessage = { 
        role: "assistant", 
        content: "I'm having trouble connecting right now, but I'm here for you. How can I help?"
      };
      setChatMessages([...newMessages, aiMessage]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header userName={userName} />
      
      {/* Sidebar */}
      <Sidebar 
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
      />

      {/* Main Content - with margin for header and sidebar */}
      <div className="ml-52 pt-14 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wellness Dashboard
            </h1>
            <Sparkles className="text-purple-600" size={32} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <MessageCircle size={20} />
              AI Coach
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {[
            { id: "mood", label: "Mood Tracker", icon: Heart },
            { id: "insights", label: "AI Insights", icon: Brain },
            { id: "goals", label: "Wellness Goals", icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mood Tracker Tab */}
        {activeTab === "mood" && (
          <div className="space-y-6">
            {/* Mood Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                How are you feeling today?
              </h2>
              <div className="flex justify-center gap-6">
                {moods.map((mood, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoodSelect(index)}
                    className={`flex flex-col items-center p-6 rounded-xl transition-all transform hover:scale-110 ${
                      selectedMood === index
                        ? `${mood.bgColor} ring-4 ${mood.ringColor} scale-110 shadow-xl`
                        : mood.color + " shadow-md"
                    }`}
                  >
                    <span className="text-6xl mb-2">{mood.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{mood.label}</span>
                  </button>
                ))}
              </div>

              {/* AI Response */}
              {showMessage && selectedMood !== null && (
                <div className={`mt-6 p-6 rounded-xl border-2 ${moods[selectedMood].messageColor} animate-fade-in shadow-lg`}>
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{moods[selectedMood].emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-xl">
                          You're feeling {moods[selectedMood].label}
                        </h3>
                        <Sparkles size={20} className="text-teal-600" />
                      </div>
                      
                      {loadingAI ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <RefreshCw className="animate-spin" size={16} />
                          <span>AI is generating personalized advice...</span>
                        </div>
                      ) : (
                        <p className="text-base leading-relaxed">{aiAdvice}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowMessage(false)}
                      className="text-gray-500 hover:text-gray-700 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wellness Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl shadow-lg p-6 border border-pink-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <Heart className="text-red-500" size={24} />
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

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <Zap className="text-yellow-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Energy Boost
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Quick 5-minute movement break to refresh your mind
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily AI Tip */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Sparkles className="text-white/30" size={40} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Brain size={28} />
                <h3 className="text-2xl font-bold">AI Wellness Tip</h3>
                <button
                  onClick={fetchDailyTip}
                  className="ml-auto p-2 hover:bg-white/20 rounded-xl transition-all"
                  title="Get new tip"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <p className="text-lg leading-relaxed font-medium">
                "{dailyTip}"
              </p>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === "insights" && (
          <div className="space-y-6">
            {/* Weekly Pattern Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="text-purple-600" size={28} />
                  Weekly Mood Pattern
                </h2>
                <button
                  onClick={analyzeWeeklyPattern}
                  disabled={analyzingPattern}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {analyzingPattern ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Analyze Pattern
                    </>
                  )}
                </button>
              </div>

              {/* Mood History Chart */}
              <div className="flex justify-around items-end h-56 mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                {moodHistory.map((day, idx) => {
                  // Calculate bar height based on mood value (1-5)
                  const barHeight = 50 + (day.value * 35);
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-3">
                      <div 
                        className="w-16 bg-gradient-to-t from-purple-400 to-purple-600 rounded-t-xl transition-all hover:from-purple-500 hover:to-purple-700 cursor-pointer shadow-md"
                        style={{ height: `${barHeight}px` }}
                        title={`${day.mood} - ${day.date}`}
                      />
                      <span className="text-3xl">{day.emoji}</span>
                      <span className="text-sm font-semibold text-gray-700">{day.date}</span>
                    </div>
                  );
                })}
              </div>

              {/* AI Insights */}
              {weeklyInsights && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <Brain className="text-green-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-3">
                        AI-Generated Insights
                      </h4>
                      <p className="text-gray-800 mb-3 leading-relaxed">
                        {weeklyInsights.message}
                      </p>
                      <div className="bg-white/60 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium text-gray-700">
                          💡 Suggestion: {weeklyInsights.suggestion}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700">
                          ⭐ Your Strength: {weeklyInsights.strength}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wellness Goals Tab */}
        {activeTab === "goals" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="text-purple-600" size={28} />
              Your Wellness Goals
            </h2>
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Set personalized wellness goals coming soon!</p>
            </div>
          </div>
        )}

        {/* AI Chatbot Modal */}
        {showChatbot && (
          <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={24} />
                <h3 className="font-semibold">AI Wellness Coach</h3>
              </div>
              <button
                onClick={() => setShowChatbot(false)}
                className="hover:bg-white/20 p-1 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Brain size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Hi! I'm your AI wellness coach.</p>
                  <p className="text-sm mt-2">How can I support you today?</p>
                </div>
              )}
              
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {loadingChat && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <RefreshCw className="animate-spin" size={20} />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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