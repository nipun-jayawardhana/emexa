import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client'; // ADD THIS
import camera from '../lib/camera';
import { Camera, Check, X, BookOpen } from 'lucide-react';

export default function Permission() {
  const [webcamPermission, setWebcamPermission] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [starting, setStarting] = useState(false);
  const [lastEmotion, setLastEmotion] = useState(null); // NEW: Track detected emotion
  const [socket, setSocket] = useState(null); // NEW: WebSocket connection

  const previewRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const captureIntervalRef = useRef(null); // NEW: For emotion capture interval

  // NEW: Initialize WebSocket connection
  useEffect(() => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const newSocket = io(API_URL);

    newSocket.on('connect', () => {
      console.log('🔌 WebSocket connected for emotion tracking');
    });

    newSocket.on('emotion-result', (data) => {
      console.log('✅ Emotion detected:', data);
      setLastEmotion(data);
    });

    newSocket.on('emotion-error', (error) => {
      console.error('❌ Emotion analysis error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // NEW: Function to capture and send frame to AI
  const captureAndAnalyzeEmotion = async () => {
    try {
      console.log('🔍 ATTEMPTING TO CAPTURE EMOTION...'); 

      const params = new URLSearchParams(location.search);
      const quizId = params.get('quizId') || 'active-quiz';
      const userId = localStorage.getItem('userId') || 'student-id';
      const sessionId = `session-${Date.now()}`;


    console.log('📋 User ID:', userId); 
    console.log('📋 Quiz ID:', quizId); 
    console.log('📋 Socket status:', socket ? 'Connected' : 'Not connected'); 

      // Capture frame from camera
      const canvas = document.createElement('canvas');
      const video = previewRef.current?.querySelector('video');

       console.log('📹 Video element:', video ? 'Found' : 'NOT FOUND');
      
      if (!video || !socket) {
        console.log('Video or socket not available');
        return;
      }

      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, 224, 224);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);

      // Send to backend via WebSocket for AI analysis
      socket.emit('analyze-emotion', {
        userId,
        quizId,
        sessionId,
        questionIndex: 0, // Update this based on current question
        image: base64Image
      });

      console.log('📸 Frame sent for emotion analysis');
    } catch (error) {
      console.error('Error capturing emotion:', error);
    }
  };

  // NEW: Start emotion tracking when camera is allowed
  const startEmotionTracking = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    // Capture emotion every 60 seconds
    captureIntervalRef.current = setInterval(() => {
      captureAndAnalyzeEmotion();
    }, 60000); // 60 seconds

    // Capture first frame immediately
    setTimeout(() => {
      captureAndAnalyzeEmotion();
    }, 2000); // Wait 2 seconds for camera to initialize
  };

  // NEW: Stop emotion tracking
  const stopEmotionTracking = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  const handleAllow = async () => {
    setWebcamPermission('allowed');
    setCancelled(false);
    setStarting(true);
    
    try {
      if (previewRef.current) {
        camera.start({ previewElement: previewRef.current, capture: false }).then((ok) => {
          if (!ok) {
            setWebcamPermission('denied');
            setStarting(false);
          } else {
            // NEW: Start AI emotion tracking after camera starts
            setTimeout(() => {
              startEmotionTracking();
            }, 3000); // Wait 3 seconds for camera to fully initialize
          }
        }).catch((err) => {
          console.error('camera.start failed', err);
          setWebcamPermission('denied');
          setStarting(false);
        });
      } else {
        camera.start({ capture: false }).then((ok) => {
          if (!ok) {
            setWebcamPermission('denied');
            setStarting(false);
          } else {
            setTimeout(() => {
              startEmotionTracking();
            }, 3000);
          }
        }).catch((err) => {
          console.error('camera.start failed', err);
          setWebcamPermission('denied');
          setStarting(false);
        });
      }

      if (camera && camera.attachPreview) {
        let tries = 0;
        const attachInterval = setInterval(() => {
          tries += 1;
          try {
            if (previewRef.current && camera.attachPreview(previewRef.current)) {
              clearInterval(attachInterval);
              setStarting(false);
            } else if (tries > 60) {
              clearInterval(attachInterval);
              setStarting(false);
            }
          } catch (e) {
            if (tries > 60) {
              clearInterval(attachInterval);
              setStarting(false);
            }
          }
        }, 50);
      }
    } catch (err) {
      console.error('Error starting camera on allow', err);
      setWebcamPermission('denied');
    }
  };

  const handleDeny = () => {
    setWebcamPermission('denied');
    stopEmotionTracking(); // NEW: Stop AI tracking
    
    try {
      if (camera && camera.isActive && camera.isActive()) {
        camera.stop();
        console.log('Camera stopped due to user deny');
      }
    } catch (err) {
      console.error('Error stopping camera on deny', err);
    }
  };

  const handleStartQuiz = () => {
    if (webcamPermission === 'allowed' || webcamPermission === 'denied') {
      console.log('Starting quiz...', webcamPermission);
      const params = new URLSearchParams(location.search);
      const quizId = params.get('quizId') || 'active-quiz';
      
      if (webcamPermission === 'allowed') {
        try {
          camera.startCapture({ intervalMs: 60000, quality: 0.6, quizId });
        } catch (err) {
          console.error('startCapture failed', err);
        }
      }
      
      navigate(`/quiz/${encodeURIComponent(quizId)}`);
    } else {
      alert('Please choose Allow or Deny to continue');
    }
  };

  useEffect(() => {
    let mounted = true;
    const startCamera = async () => {
      if (!mounted) return;
      try {
        if (previewRef.current && camera && camera.attachPreview) {
          camera.attachPreview(previewRef.current);
        } else {
          const ok = await camera.start({ previewElement: previewRef.current, capture: false });
          if (!ok) setWebcamPermission('denied');
        }
      } catch (err) {
        console.error('camera.start/attachPreview error', err);
        setWebcamPermission('denied');
      }
    };

    if (webcamPermission === 'allowed') {
      setTimeout(startCamera, 0);
    }

    return () => {
      mounted = false;
      stopEmotionTracking(); // NEW: Cleanup
      try { camera.stop(); } catch (e) {}
    };
  }, [webcamPermission]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Quiz
          </h1>
          <p className="text-gray-600">
            Before we begin, we'd like your permission to monitor your emotional responses during the quiz.
          </p>
        </div>

        {/* NEW: Emotion Status Display */}
        {lastEmotion && webcamPermission === 'allowed' && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-700">
              🤖 Current Emotion: <strong>{lastEmotion.emotion}</strong> 
              ({Math.round(lastEmotion.confidence * 100)}% confidence)
            </p>
          </div>
        )}

        {/* Permission Box */}
        <div className="bg-[#bdf2d1] rounded-lg p-6 border border-[#bdf2d1]">
          <div className="mb-6">
            <div className="flex items-start gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-[#064e37] mt-0.5" />
              <h2 className="text-lg font-semibold text-gray-900">
                Why we capture emotions
              </h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Understanding your emotional responses helps us improve our teaching methods and provide 
              better support. Your emotional data is used only for educational purposes and is kept strictly 
              confidential.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Webcam Permission
            </h3>
            
            <div className={`rounded-lg mb-6 shadow-sm ${webcamPermission === 'allowed' ? 'bg-transparent p-0 border-none overflow-visible relative' : 'bg-white p-4 border-2 border-dashed border-gray-300'}`}>
              <div className="flex items-center justify-center text-center">
                <div
                  ref={previewRef}
                  style={
                    webcamPermission === 'allowed'
                      ? { width: '100%', height: 0, paddingTop: '56.25%', position: 'relative' }
                      : { width: '547.56px', height: '351.56px' }
                  }
                  className={`flex items-center justify-center overflow-hidden rounded-lg relative ${webcamPermission === 'allowed' ? 'bg-transparent' : 'bg-white'}`}
                >
                  {/* Loading Spinner */}
                  {starting && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                    </div>
                  )}

                  {webcamPermission !== 'allowed' && (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Camera className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 max-w-2xl">
                        We need access to your webcam to capture emotional responses during the quiz.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {webcamPermission === 'allowed' && (
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 3, zIndex: 50 }}>
                  <button
                    onClick={() => {
                      stopEmotionTracking();
                      try { camera.stopCapture(); } catch (e) {}
                      try { camera.stop(); } catch (e) {}
                      try {
                        document.querySelectorAll('video').forEach(v => {
                          try {
                            const s = v.srcObject;
                            if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
                          } catch (e) {}
                          try { if (v.parentNode) v.parentNode.removeChild(v); } catch (e) {}
                        });
                      } catch (e) {}
                      setWebcamPermission(null);
                      setLastEmotion(null);
                    }}
                    aria-label="Cancel camera"
                    title="Cancel camera"
                    className="bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-full shadow-md flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {webcamPermission !== 'allowed' && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onPointerDown={() => {
                      try {
                        if (camera && camera.isActive && !camera.isActive()) camera.start({ capture: false }).catch(() => {});
                      } catch (e) {}
                    }}
                    onClick={handleAllow}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                      webcamPermission === 'allowed'
                        ? 'bg-[#064e37] text-white'
                        : 'bg-[#bdf2d1] text-[#064e37] hover:bg-[#a8e8c1]'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Allow
                  </button>

                  <button
                    onClick={handleDeny}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                      webcamPermission === 'denied'
                        ? 'bg-red-600 text-white'
                        : 'bg-[#bdf2d1] text-[#064e37] hover:bg-[#a8e8c1]'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    Deny
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mb-6">
              Please select whether to allow or deny webcam access for emotion tracking.
            </p>

            <div className="flex justify-center">
              <button
                onClick={handleStartQuiz}
                disabled={!webcamPermission}
                className={`px-8 py-3 rounded-md font-medium transition-all ${
                  (webcamPermission === 'allowed' || webcamPermission === 'denied')
                    ? 'bg-[#064e37] text-white hover:bg-[#053827] cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {webcamPermission && (
          <div className={`mt-4 p-3 rounded-md text-center text-sm ${
            webcamPermission === 'allowed'
              ? 'bg-[#bdf2d1] text-[#064e37]'
              : 'bg-yellow-50 text-amber-800'
          }`}>
            {webcamPermission === 'allowed'
              ? '✓ Webcam access granted. AI emotion tracking is active.'
              : '✗ Quiz access is available, but personal analytics are currently unavailable.'}
          </div>
        )}
      </div>
    </div>
  );
}