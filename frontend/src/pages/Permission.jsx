import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import camera from '../lib/camera';
import { Camera, Check, X, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export default function Permission() {
  const [webcamPermission, setWebcamPermission] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');
  const [lastEmotion, setLastEmotion] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Socket.io connection
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('🔌 Connecting to Socket.io server:', API_URL);
    
    const newSocket = io(API_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected:', newSocket.id);
      if (mountedRef.current) {
        setSocketConnected(true);
      }
    });

    newSocket.on('connected', (data) => {
      console.log('✅ Server confirmation:', data);
      if (mountedRef.current) {
        setSocketConnected(true);
      }
    });

    newSocket.on('emotion-result', (data) => {
      console.log('✅ Emotion detected:', data);
      if (mountedRef.current) {
        setLastEmotion(data);
      }
    });

    newSocket.on('emotion-error', (error) => {
      console.error('❌ Emotion analysis error:', error);
      if (mountedRef.current) {
        setLastEmotion(null);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.io disconnected:', reason);
      if (mountedRef.current) {
        setSocketConnected(false);
      }
      
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      if (mountedRef.current) {
        setSocketConnected(false);
      }
    });

    socketRef.current = newSocket;

    return () => {
      console.log('🧹 Cleaning up socket');
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Check permission state
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        if (mountedRef.current) {
          setPermissionState(result.state);
          console.log('📹 Camera permission:', result.state);
        }
        
        result.addEventListener('change', () => {
          if (mountedRef.current) {
            setPermissionState(result.state);
          }
        });
      } catch (err) {
        console.log('⚠️ Permissions API not supported');
      }
    };
    
    checkPermission();
  }, []);

  const captureAndAnalyzeEmotion = async () => {
    const socket = socketRef.current;
    
    if (!socket || !socket.connected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    if (!videoRef.current) {
      console.warn('⚠️ Video element not available');
      return;
    }

    const video = videoRef.current;

    // CRITICAL FIX: Check video readyState more thoroughly
    if (video.readyState < video.HAVE_CURRENT_DATA) {
      console.warn('⚠️ Video not ready (readyState:', video.readyState, ')');
      return;
    }

    // Additional checks
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('⚠️ Video dimensions not available');
      return;
    }

    try {
      console.log('📸 Capturing emotion...');

      const params = new URLSearchParams(location.search);
      const quizId = params.get('quizId') || 'active-quiz';
      const userId = localStorage.getItem('userId') || 'student-' + Date.now();
      const sessionId = `session-${Date.now()}`;

      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, 224, 224);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);

      console.log('📤 Sending to server... (image size:', base64Image.length, 'bytes)');

      socket.emit('analyze-emotion', {
        userId,
        quizId,
        sessionId,
        questionIndex: 0,
        image: base64Image,
        timestamp: Date.now()
      });

      console.log('✅ Sent successfully');
    } catch (error) {
      console.error('❌ Capture error:', error);
    }
  };

  const startEmotionTracking = () => {
    if (!socketConnected) {
      console.log('⏸️ Socket not connected, waiting...');
      return;
    }

    if (!videoReady) {
      console.log('⏸️ Video not ready, waiting...');
      return;
    }

    console.log('🎬 Starting emotion tracking...');
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    // First capture after 3 seconds (shorter delay since video is confirmed ready)
    setTimeout(() => {
      if (mountedRef.current && videoReady) {
        console.log('📸 First capture...');
        captureAndAnalyzeEmotion();
      }
    }, 3000);

    // Then every 30 seconds (reduced from 60 for testing)
    captureIntervalRef.current = setInterval(() => {
      if (mountedRef.current && videoReady) {
        captureAndAnalyzeEmotion();
      }
    }, 30000);
  };

  const stopEmotionTracking = () => {
    console.log('🛑 Stopping tracking...');
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  const handleAllow = async () => {
    console.log('✅ User clicked Allow');
    if (!mountedRef.current) return;
    
    setWebcamPermission(null);
    setStarting(true);
    setError(null);
    setVideoReady(false);
    
    try {
      console.log('🎥 Requesting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      console.log('✅ Camera granted!');
      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        console.log('📹 Video element attached, starting playback...');
        
        // SIMPLIFIED APPROACH: Just wait for video to be ready
        const checkVideoReady = () => {
          console.log('🔍 Checking video readyState:', video.readyState);
          console.log('🔍 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
          console.log('🔍 Video paused:', video.paused);
          
          if (video.readyState >= 2 && video.videoWidth > 0) {
            console.log('✅ Video is ready!');
            if (mountedRef.current) {
              setVideoReady(true);
            }
          } else {
            console.log('⏳ Video not ready yet, checking again...');
            setTimeout(checkVideoReady, 500);
          }
        };
        
        // Auto-play video
        video.play()
          .then(() => {
            console.log('▶️ Video play() started');
            // Check if ready immediately
            setTimeout(checkVideoReady, 1000);
          })
          .catch(err => {
            console.error('❌ Video play error:', err);
            // Still check - might work anyway
            setTimeout(checkVideoReady, 1000);
          });
      }

      // Try camera library
      try {
        if (camera && typeof camera.start === 'function') {
          await camera.start({ capture: false });
          console.log('📸 Camera lib initialized');
        }
      } catch (err) {
        console.warn('⚠️ Camera lib not available:', err.message);
      }

      if (mountedRef.current) {
        setWebcamPermission('allowed');
        setStarting(false);
        setPermissionState('granted');
      }

    } catch (err) {
      console.error('❌ Camera error:', err);
      
      if (!mountedRef.current) return;
      
      let errorMessage = 'Failed to access camera';
      let helpText = '';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied';
        helpText = 'Click the camera icon (🎥) in your address bar and select "Allow"';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found';
        helpText = 'Ensure a camera is connected and not in use by another app';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera already in use';
        helpText = 'Close other apps using the camera and try again';
      } else {
        helpText = err.message || 'Unknown error';
      }
      
      setError({ message: errorMessage, help: helpText });
      setWebcamPermission('denied');
      setStarting(false);
      setPermissionState('denied');
    }
  };

  // Start tracking when video becomes ready
  useEffect(() => {
    if (videoReady && socketConnected && webcamPermission === 'allowed') {
      console.log('🎯 Both video and socket ready - starting tracking');
      // Delay to ensure video is stable
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          startEmotionTracking();
        }
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        stopEmotionTracking();
      };
    }
  }, [videoReady, socketConnected, webcamPermission]);

  const handleDeny = () => {
    console.log('❌ User denied');
    if (!mountedRef.current) return;
    
    setWebcamPermission('denied');
    setError(null);
    stopEmotionTracking();
    stopCamera();
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    
    stopEmotionTracking();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      if (camera?.stop) camera.stop();
      if (camera?.stopCapture) camera.stopCapture();
    } catch (e) {
      console.warn('Cleanup warning:', e);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (mountedRef.current) {
      setVideoReady(false);
    }
  };

  const handleStartQuiz = () => {
    if (webcamPermission === 'allowed' || webcamPermission === 'denied') {
      console.log('🎯 Starting quiz...');
      const params = new URLSearchParams(location.search);
      const quizId = params.get('quizId') || 'active-quiz';
      
      if (webcamPermission === 'allowed' && camera?.startCapture) {
        try {
          camera.startCapture({ intervalMs: 30000, quality: 0.6, quizId });
        } catch (err) {
          console.warn('startCapture failed', err);
        }
      }
      
      navigate(`/quiz/${encodeURIComponent(quizId)}`);
    } else {
      alert('Please choose Allow or Deny to continue');
    }
  };

  const handleCancelCamera = () => {
    console.log('❌ Cancel camera');
    stopCamera();
    if (mountedRef.current) {
      setWebcamPermission(null);
      setError(null);
      setLastEmotion(null);
    }
  };

  const handleRetry = () => {
    if (!mountedRef.current) return;
    setError(null);
    setWebcamPermission(null);
    setStarting(false);
  };

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Quiz
          </h1>
          <p className="text-gray-600">
            Before we begin, we'd like your permission to monitor your emotional responses during the quiz.
          </p>
        </div>

        {/* Socket status */}
        <div className={`mb-4 ${socketConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3 text-center text-sm`}>
          <p className={socketConnected ? 'text-green-700' : 'text-yellow-700'}>
            {socketConnected ? '✅ Connected to emotion detection server' : '⏳ Connecting to server...'}
          </p>
        </div>

        {/* Video ready status (for debugging) */}
        {webcamPermission === 'allowed' && (
          <div className={`mb-4 ${videoReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3 text-center text-sm`}>
            <p className={videoReady ? 'text-green-700' : 'text-yellow-700'}>
              {videoReady ? '✅ Video ready for capture' : '⏳ Preparing video...'}
            </p>
          </div>
        )}

        {/* Detected emotion */}
        {lastEmotion && webcamPermission === 'allowed' && socketConnected && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Current Emotion: <span className="text-lg font-bold capitalize">{lastEmotion.emotion}</span>
                </p>
                {lastEmotion.confidence && (
                  <p className="text-xs text-blue-600 mt-1">
                    Confidence: {Math.round(lastEmotion.confidence * 100)}%
                  </p>
                )}
              </div>
              <div className="text-3xl">
                {lastEmotion.emotion === 'happy' && '😊'}
                {lastEmotion.emotion === 'sad' && '😢'}
                {lastEmotion.emotion === 'angry' && '😠'}
                {lastEmotion.emotion === 'fearful' && '😨'}
                {lastEmotion.emotion === 'surprised' && '😮'}
                {lastEmotion.emotion === 'disgusted' && '🤢'}
                {lastEmotion.emotion === 'neutral' && '😐'}
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">{error.message}</h3>
                <p className="text-sm text-red-700 whitespace-pre-line">{error.help}</p>
                <button
                  onClick={handleRetry}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permission blocked warning */}
        {permissionState === 'denied' && !error && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Camera permission blocked.</strong> Reset in browser settings to enable.
              </div>
            </div>
          </div>
        )}

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
            
            <div className={`rounded-lg mb-6 shadow-sm relative ${
              webcamPermission === 'allowed' 
                ? 'bg-black overflow-hidden' 
                : 'bg-white p-4 border-2 border-dashed border-gray-300'
            }`}>
              {/* Video */}
              {webcamPermission === 'allowed' && (
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    preload="auto"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    onLoadedMetadata={() => console.log('🎬 Video metadata loaded')}
                    onLoadedData={() => console.log('📦 Video data loaded')}
                    onCanPlay={() => console.log('✅ Video can play')}
                    onPlaying={() => console.log('▶️ Video is playing')}
                    onError={(e) => console.error('❌ Video error:', e)}
                  />
                  
                  {!videoReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                      <p className="text-white text-sm">Starting camera...</p>
                    </div>
                  )}

                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-3">
                    <button
                      onClick={handleCancelCamera}
                      className="bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Permission prompt */}
              {webcamPermission !== 'allowed' && (
                <div className="flex flex-col items-center justify-center p-8 min-h-[320px]">
                  {starting ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#064e37] border-t-transparent mb-4"></div>
                      <p className="text-gray-600 text-sm">Requesting camera access...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 max-w-md text-center mb-6">
                        We need access to your webcam to capture emotional responses during the quiz.
                      </p>
                      
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={handleAllow}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm bg-[#064e37] text-white hover:bg-[#053827]"
                        >
                          <Check className="w-4 h-4" />
                          Allow
                        </button>

                        <button
                          onClick={handleDeny}
                          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                            webcamPermission === 'denied'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <X className="w-4 h-4" />
                          Deny
                        </button>
                      </div>
                    </>
                  )}
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
                    ? 'bg-[#064e37] text-white hover:bg-[#053827] cursor-pointer shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>

        {webcamPermission && !error && (
          <div className={`mt-4 p-3 rounded-md text-center text-sm ${
            webcamPermission === 'allowed'
              ? 'bg-[#bdf2d1] text-[#064e37]'
              : 'bg-yellow-50 text-amber-800'
          }`}>
            {webcamPermission === 'allowed'
              ? `✓ Webcam granted. ${videoReady && socketConnected ? 'Emotion tracking active.' : 'Initializing...'}`
              : '✗ Quiz available without emotion tracking.'}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}