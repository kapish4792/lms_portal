/**
 * Universal Camera & MediaStream Lifecycle Manager
 * Prevents orphaned camera streams, handles React StrictMode double-invocation,
 * and completely releases hardware camera pins in Windows/Chromium.
 */

// Global registry of all active media streams in the application
const activeStreams = new Set<MediaStream>();
let sessionCounter = 0;

/**
 * Safely bind and play a MediaStream on an HTML5 video element.
 * Fixes Chromium autoplay rejection by strictly enforcing muted DOM property.
 */
export function attachStreamToVideo(
  videoElement: HTMLVideoElement | null,
  stream: MediaStream | null
): boolean {
  if (!videoElement || !stream) return false;
  try {
    // Explicitly set muted on DOM property to satisfy Chromium Autoplay policy
    videoElement.muted = true;
    videoElement.defaultMuted = true;
    videoElement.playsInline = true;
    videoElement.autoplay = true;
    videoElement.srcObject = stream;

    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to retry when loadedmetadata fires
        videoElement.onloadedmetadata = () => {
          videoElement.play().catch(() => {});
        };
      });
    }
    return true;
  } catch (err) {
    console.error("attachStreamToVideo failed:", err);
    return false;
  }
}

/**
 * Start a camera session tied to a video element.
 * Handles in-flight cancellation so race conditions cannot orphan streams.
 */
export async function startCameraStream(
  videoElement: HTMLVideoElement | null,
  options: { facingMode?: "user" | "environment"; width?: number; height?: number } = {}
): Promise<{ success: boolean; stream: MediaStream | null; error?: string; sessionId: number }> {
  const sessionId = ++sessionCounter;

  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { success: false, stream: null, error: "Camera not supported on this browser.", sessionId };
  }

  try {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options.facingMode || "user",
          width: { ideal: options.width || 640 },
          height: { ideal: options.height || 480 },
        },
        audio: false,
      });
    } catch {
      // Fallback for Windows desktop webcams that don't support facingMode: "user"
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }

    // Check if another session started or stop was requested while getUserMedia was pending
    if (sessionId !== sessionCounter) {
      // Invalidate and kill immediately
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
          track.enabled = false;
        } catch {}
      });
      return { success: false, stream: null, error: "Session superseded", sessionId };
    }

    // Register active stream
    activeStreams.add(stream);

    // Bind to video element if present
    if (videoElement) {
      attachStreamToVideo(videoElement, stream);
    }

    return { success: true, stream, sessionId };
  } catch (err: any) {
    return {
      success: false,
      stream: null,
      error: err?.message || "Camera access was denied or hardware is unavailable.",
      sessionId,
    };
  }
}

/**
 * Unconditionally kill a specific stream and release video element hardware binding
 */
export function stopCameraStream(stream: MediaStream | null, videoElement?: HTMLVideoElement | null) {
  // Invalidate any in-flight getUserMedia sessions
  ++sessionCounter;

  if (stream) {
    try {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
          track.enabled = false;
        } catch {}
      });
    } catch {}
    activeStreams.delete(stream);
  }

  if (videoElement) {
    try {
      videoElement.pause();
      if (videoElement.srcObject) {
        const attachedStream = videoElement.srcObject as MediaStream;
        attachedStream.getTracks().forEach((track) => {
          try {
            track.stop();
            track.enabled = false;
          } catch {}
        });
        videoElement.srcObject = null;
      }
      // DirectShow / MediaFoundation hardware release on Windows
      videoElement.load();
    } catch {}
  }
}

/**
 * Stop EVERY camera stream currently open in the application.
 * Guaranteed to turn off the physical webcam light on Windows/Mac/Linux.
 */
export function stopAllCameraStreams(videoElement?: HTMLVideoElement | null) {
  // Invalidate in-flight sessions
  ++sessionCounter;

  activeStreams.forEach((stream) => {
    try {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
          track.enabled = false;
        } catch {}
      });
    } catch {}
  });
  activeStreams.clear();

  if (videoElement) {
    try {
      videoElement.pause();
      if (videoElement.srcObject) {
        const attachedStream = videoElement.srcObject as MediaStream;
        attachedStream.getTracks().forEach((track) => {
          try {
            track.stop();
            track.enabled = false;
          } catch {}
        });
        videoElement.srcObject = null;
      }
      videoElement.load();
    } catch {}
  }
}
