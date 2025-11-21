const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';

let stream = null;
let videoMain = null; // video element shown in provided preview container
let videoGlobal = null; // floating persistent preview
let captureInterval = null;
let streaming = false;
let capturing = false;

const start = async ({ intervalMs = 2000, quality = 0.6, quizId = 'active-quiz', userId = null, previewElement = null, persistentPreview = false, capture = true } = {}) => {
  if (streaming) return true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('getUserMedia not supported');
    return false;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // create main video element for the preview (if any)
    videoMain = document.createElement('video');
    videoMain.muted = true;
    videoMain.autoplay = true;
    videoMain.playsInline = true;
    videoMain.srcObject = stream;

    // If a previewElement (DOM element) is provided, append the video there and style to fit.
    // Otherwise create a hidden tiny element appended to body to keep the stream alive.
    if (previewElement) {
      let container = null;
      if (typeof previewElement === 'string') {
        container = document.getElementById(previewElement) || document.querySelector(previewElement);
      } else if (previewElement instanceof HTMLElement) {
        container = previewElement;
      }

      if (container) {
        // clear container
        container.innerHTML = '';
        videoMain.style.width = '100%';
        videoMain.style.height = '100%';
        videoMain.style.borderRadius = '12px';
        videoMain.style.objectFit = 'cover';
        videoMain.style.display = 'block';
        videoMain.style.opacity = '1';
        container.appendChild(videoMain);
        // ensure container has position so React overlays can position elements inside it
        if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
      } else {
        // fallback to hidden placement
        videoMain.style.position = 'fixed';
        videoMain.style.right = '0';
        videoMain.style.bottom = '0';
        videoMain.style.width = '1px';
        videoMain.style.height = '1px';
        videoMain.style.opacity = '0';
        document.body.appendChild(videoMain);
      }
    } else {
      videoMain.style.position = 'fixed';
      videoMain.style.right = '0';
      videoMain.style.bottom = '0';
      videoMain.style.width = '1px';
      videoMain.style.height = '1px';
      videoMain.style.opacity = '0';
      document.body.appendChild(videoMain);
    }

    try { await videoMain.play(); } catch (e) { /* autoplay blocked or not important */ }

    // start capture interval if requested
    if (capture) {
      startCapture({ intervalMs, quality, quizId, userId });
    }

    // If persistent preview requested, create or attach a global floating preview
    if (persistentPreview) {
      let globalContainer = document.getElementById('global-camera-preview');
      if (!globalContainer) {
        globalContainer = document.createElement('div');
        globalContainer.id = 'global-camera-preview';
        globalContainer.style.position = 'fixed';
        globalContainer.style.left = '12px';
        globalContainer.style.bottom = '12px';
        globalContainer.style.width = '160px';
        globalContainer.style.height = '120px';
        globalContainer.style.zIndex = '99999';
        globalContainer.style.borderRadius = '8px';
        globalContainer.style.overflow = 'hidden';
        globalContainer.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
        globalContainer.style.background = '#000';
        document.body.appendChild(globalContainer);
      }

      // Create a global video element that also attaches to the same stream
      videoGlobal = document.createElement('video');
      videoGlobal.muted = true;
      videoGlobal.autoplay = true;
      videoGlobal.playsInline = true;
      videoGlobal.srcObject = stream;
      videoGlobal.style.width = '100%';
      videoGlobal.style.height = '100%';
      videoGlobal.style.objectFit = 'cover';
      videoGlobal.style.display = 'block';
      videoGlobal.style.opacity = '1';
      globalContainer.innerHTML = '';
      globalContainer.appendChild(videoGlobal);

      // (no automatic control added here) global preview is managed by page UI
      try { await videoGlobal.play(); } catch (e) { /* ignore */ }
    }

    streaming = true;
    console.log('Camera streaming started');
    return true;
  } catch (err) {
    console.error('Failed to start camera', err);
    stop();
    return false;
  }
};

const stop = () => {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
    capturing = false;
  }
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  if (videoMain) {
    if (videoMain.parentNode) videoMain.parentNode.removeChild(videoMain);
    videoMain = null;
  }
  if (videoGlobal) {
    if (videoGlobal.parentNode) videoGlobal.parentNode.removeChild(videoGlobal);
    videoGlobal = null;
  }
  streaming = false;
  console.log('Camera streaming stopped');
};

// Start periodic capture only (doesn't affect preview/video elements)
const startCapture = ({ intervalMs = 60000, quality = 0.6, quizId = 'active-quiz', userId = null } = {}) => {
  if (capturing) return true;
  if (!stream) {
    console.warn('startCapture: no active stream');
    return false;
  }

  captureInterval = setInterval(() => {
    try {
      const src = (videoMain && videoMain.readyState >= 2) ? videoMain : (videoGlobal && videoGlobal.readyState >= 2 ? videoGlobal : null);
      if (!src) return;
      const canvas = document.createElement('canvas');
      canvas.width = src.videoWidth || 640;
      canvas.height = src.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      fetch(`${API_BASE}/api/camera/frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, quizId, userId, timestamp: Date.now() })
      }).catch(err => console.error('camera send frame error', err));
    } catch (err) {
      console.error('capture error', err);
    }
  }, intervalMs);

  capturing = true;
  return true;
};

const stopCapture = () => {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
    capturing = false;
  }
};

const isActive = () => streaming;

export default { start, stop, isActive, startCapture, stopCapture };
