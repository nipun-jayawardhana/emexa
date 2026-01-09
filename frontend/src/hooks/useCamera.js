// frontend/src/hooks/useCamera.js
import { useState, useEffect, useRef, useCallback } from 'react';
import socketService from '../services/socketService';

const useCamera = (userId, quizId, sessionId, currentQuestionIndex) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastEmotion, setLastEmotion] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const captureIntervalRef = useRef(null);

  // Request camera permission and initialize video stream
  const requestPermission = useCallback(async () => {
    try {
      console.log('📷 Requesting camera permission...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 224 },
          height: { ideal: 224 },
          facingMode: 'user'
        },
        audio: false
      });

      console.log('✅ Camera permission granted');

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = 'none'; // Hide video element
      }

      setHasPermission(true);
      setError(null);

      return true;
    } catch (err) {
      console.error('❌ Camera permission denied:', err);
      setHasPermission(false);
      setError(err.message);
      return false;
    }
  }, []);

  // Capture frame and send to backend
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !hasPermission || !userId || !quizId || !sessionId) {
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = 224;
      canvas.height = 224;

      // Draw current video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0, 224, 224);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send to backend via socket
      socketService.emit('analyze-emotion', {
        userId,
        sessionId,
        questionIndex: currentQuestionIndex,
        image: imageData,
        timestamp: Date.now()
      });

      console.log('📸 Frame captured and sent for emotion analysis');

    } catch (err) {
      console.error('❌ Error capturing frame:', err);
      setError(err.message);
    }
  }, [hasPermission, userId, quizId, sessionId, currentQuestionIndex]);

  // Start automatic capture every 60 seconds
  const startCapturing = useCallback(() => {
    if (!hasPermission || isCapturing) {
      return;
    }

    console.log('🎥 Starting emotion capture every 60 seconds');

    setIsCapturing(true);

    // Capture immediately
    captureFrame();

    // Set up interval for every 60 seconds
    captureIntervalRef.current = setInterval(() => {
      captureFrame();
    }, 60000);

  }, [hasPermission, isCapturing, captureFrame]);

  // Stop capturing and clean up
  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera capture');

    setIsCapturing(false);
    setLastEmotion(null);

    // Clear capture interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setHasPermission(false);
  }, []);

  // Listen for emotion results from socket
  useEffect(() => {
    const handleEmotionResult = (data) => {
      console.log('😊 Emotion detected:', data);
      setLastEmotion(data);
    };

    const handleEmotionError = (error) => {
      console.error('❌ Emotion detection error:', error);
      setError(error.message);
    };

    socketService.on('emotion-result', handleEmotionResult);
    socketService.on('emotion-error', handleEmotionError);

    return () => {
      socketService.off('emotion-result', handleEmotionResult);
      socketService.off('emotion-error', handleEmotionError);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    hasPermission,
    isCapturing,
    lastEmotion,
    error,
    videoRef,
    requestPermission,
    startCapturing,
    stopCamera
  };
};

export default useCamera;