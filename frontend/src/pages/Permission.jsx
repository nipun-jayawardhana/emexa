import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import camera from '../lib/camera';
import { Camera, Check, X, BookOpen } from 'lucide-react';

export default function Permission() {
  const [webcamPermission, setWebcamPermission] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const handleAllow = () => {
    // Hide placeholder immediately and start camera
    setShowPlaceholder(false);
    setWebcamPermission('allowed');
    setCancelled(false);
    
    // Start camera without waiting (non-blocking for instant UI response)
    camera.start({ 
      previewElement: previewRef.current, 
      capture: false 
    }).then((ok) => {
      if (!ok) {
        console.error('Failed to start camera');
        setWebcamPermission('denied');
        setShowPlaceholder(true);
      } else {
        console.log('Camera started successfully');
      }
    }).catch((err) => {
      console.error('Error starting camera on allow', err);
      setWebcamPermission('denied');
      setShowPlaceholder(true);
    });
  };

  const handleDeny = () => {
    // Mark denied, stop persistent camera if it was running, and allow proceeding without webcam
    setWebcamPermission('denied');
    setStarting(false);
    try {
      // ensure persistent camera is stopped when user explicitly denies
      if (camera && camera.isActive && camera.isActive()) {
        camera.stop();
        console.log('Camera stopped due to user deny');
      }
      // Stop all camera tracks
      camera.stopCapture();
      
      // Additional cleanup: stop all video elements
      document.querySelectorAll('video').forEach(v => {
        try {
          const s = v.srcObject;
          if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
          v.srcObject = null;
        } catch (e) {
          console.error('Error stopping video track', e);
        }
      });
    } catch (err) {
      console.error('Error stopping camera on deny', err);
    }
  };

  const handleStartQuiz = () => {
    // Allow starting quiz whether user allowed webcam or explicitly denied it
    if (webcamPermission === 'allowed' || webcamPermission === 'denied') {
      console.log('Starting quiz...', webcamPermission);
      // determine target quiz id from URL query param (set by dashboard when clicking Take Quiz)
      const params = new URLSearchParams(location.search);
      const quizId = params.get('quizId') || 'active-quiz';
      
      console.log('Quiz ID from URL:', quizId);
      console.log('Current location:', location.search);
      
      // If allowed, start periodic capture
      if (webcamPermission === 'allowed') {
        try {
          // Start periodic capture (the camera stream is already active)
          camera.startCapture({ intervalMs: 60000, quality: 0.6, quizId });
          console.log('Camera capture started');
        } catch (err) {
          console.error('startCapture failed', err);
        }
      }
      
      // navigate to the quiz page for the selected quiz
      const quizPath = `/quiz/${encodeURIComponent(quizId)}`;
      console.log('Navigating to:', quizPath);
      
      try {
        navigate(quizPath);
      } catch (err) {
        console.error('Navigation error:', err);
      }
    } else {
      console.log('No permission selected yet');
      alert('Please choose Allow or Deny to continue');
    }
  };

  // Camera is now managed by the persistent singleton `frontend/src/lib/camera.js`.
  const previewRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Cleanup effect - only stop camera when component unmounts or when deny is clicked
  useEffect(() => {
    return () => {
      // Only cleanup when unmounting, not when permission state changes
      if (webcamPermission === 'denied') {
        try { 
          camera.stop();
          camera.stopCapture();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

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

        {/* Permission Box */}
            <div className="bg-[#bdf2d1] rounded-lg p-6 border border-[#bdf2d1]">
          {/* Why we capture emotions */}
          <div className="mb-6">
              <div className="flex items-start gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-[#bdf2d1] mt-0.5" />
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

          {/* Webcam Permission Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Webcam Permission
            </h3>
            
            <div className={`rounded-lg mb-6 shadow-sm relative ${webcamPermission === 'allowed' ? 'bg-black border-none' : 'bg-white p-4 border-2 border-dashed border-gray-300'}`}>
              <div className="flex items-center justify-center text-center">
                  <div
                    ref={previewRef}
                    style={
                      webcamPermission === 'allowed'
                        ? { width: '100%', height: '400px', position: 'relative', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }
                        : { width: '547.56px', height: '351.56px' }
                    }
                    className={`flex items-center justify-center rounded-lg ${webcamPermission === 'allowed' ? '' : 'bg-white overflow-hidden'}`}
                  >
                  {/* placeholder shown when no camera preview is active - controlled by showPlaceholder state */}
                  {showPlaceholder && (
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
              {/* centered cancel circle below the white box when camera is active (outside the preview) */}
              {webcamPermission === 'allowed' && (
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 3, zIndex: 50 }}>
                  <button
                    onClick={() => {
                      try { camera.stopCapture(); } catch (e) {}
                      try { camera.stop(); } catch (e) {}
                      // defensive cleanup: stop tracks on any remaining video elements
                      try {
                        document.querySelectorAll('video').forEach(v => {
                          try {
                            const s = v.srcObject;
                            if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
                          } catch (e) {}
                          try { if (v.parentNode) v.parentNode.removeChild(v); } catch (e) {}
                        });
                      } catch (e) {}
                      // Clear the preview container
                      if (previewRef.current) {
                        previewRef.current.innerHTML = '';
                      }
                      // Reset states to show placeholder again
                      setWebcamPermission(null);
                      setShowPlaceholder(true);
                    }}
                    aria-label="Cancel camera"
                    title="Cancel camera"
                    className="bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-full shadow-md flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Buttons row inside the white box, centered like in the design */}
              {webcamPermission !== 'allowed' && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={handleAllow}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                      webcamPermission === 'allowed'
                        ? 'bg-[#064e37] text-white'
                        : 'bg-[#bdf2d1] text-[#064e37] hover:bg-[#bdf2d1]'
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
                        : 'bg-[#bdf2d1] text-[#064e37] hover:bg-[#bdf2d1]'
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

            {/* Start Quiz Button */}
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
              ? '✓ Webcam access granted. You can now start the quiz.'
              : '✗ Quiz access is available, but personal analytics are currently unavailable.'}
          </div>
        )}
      </div>
    </div>
  );
}