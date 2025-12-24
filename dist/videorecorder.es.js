/**
 * VideoRecorderJS
 * A modern, promise-based library for recording Video and Audio in the browser.
 * Supports Camera, Screen Share, and Audio visualization.
 * 
 * @class VideoRecorderJS
 * @version 3.0.0
 * @author Imal Hasaranga
 * @license MIT
 */
class d {
  /**
   * @param {Object} config - Configuration object
   * @param {string|HTMLVideoElement} config.videoTagId - ID of the video element or the element itself.
   * @param {boolean} [config.log=false] - Enable debug logging.
   * @param {number} [config.videoWidth=640] - Desired video width.
   * @param {number} [config.videoHeight=480] - Desired video height.
   * @param {string} [config.mimeType='video/webm'] - Desired MIME type for recording.
   */
  constructor(e = {}) {
    if (e.videotagid && console.warn('[VideoRecorderJS] "videotagid" is deprecated. Use "videoTagId".'), e.framerate && console.warn('[VideoRecorderJS] "framerate" is deprecated. Use "frameRate".'), this.config = {
      frameRate: e.frameRate || e.framerate || 30,
      videoTagId: e.videoTagId || e.videotagid,
      videoWidth: e.videoWidth || 640,
      videoHeight: e.videoHeight || 480,
      log: e.log || !1,
      mimeType: e.mimeType || "video/webm"
    }, this.mediaRecorder = null, this.stream = null, this.canvasStream = null, this.chunks = [], this.videoElement = null, this._sourceVideo = null, this._canvas = null, this._ctx = null, this._animationId = null, this.currentFilter = "none", this.watermarkText = "", typeof this.config.videoTagId == "string" ? this.videoElement = document.getElementById(this.config.videoTagId) : this.config.videoTagId instanceof HTMLVideoElement && (this.videoElement = this.config.videoTagId), !this.videoElement)
      throw new Error("[VideoRecorderJS] Video element not found.");
    this.events = {
      "stream-ready": [],
      stop: [],
      dataavailable: [],
      "stream-ended": []
    };
  }
  /**
   * Attach an event listener.
   */
  on(e, t) {
    this.events[e] && this.events[e].push(t);
  }
  _emit(e, t) {
    this.events[e] && this.events[e].forEach((s) => s(t));
  }
  _log(e) {
    this.config.log && console.log(`[VideoRecorderJS] ${e}`);
  }
  /**
   * Sets a CSS filter for the video.
   * @param {string} filter - CSS filter string (e.g., 'grayscale(100%)', 'sepia(100%)', 'blur(5px)', 'none')
   */
  setFilter(e) {
    this.currentFilter = e || "none", this._log(`Filter set to: ${this.currentFilter}`);
  }
  /**
   * Sets a watermark text overlay.
   * @param {string} text - Text to display. Set empty string to remove.
   */
  setWatermark(e) {
    this.watermarkText = e, this._log(`Watermark set to: ${this.watermarkText}`);
  }
  /**
   * Initialize the canvas processor.
   * Creates an internal video element to play the raw stream,
   * and a canvas to draw the processed frames.
   * @private
   */
  _initProcessor() {
    this._sourceVideo || (this._sourceVideo = document.createElement("video"), this._sourceVideo.muted = !0, this._sourceVideo.autoplay = !0, this._sourceVideo.playsInline = !0), this._canvas || (this._canvas = document.createElement("canvas"), this._canvas.width = this.config.videoWidth, this._canvas.height = this.config.videoHeight, this._ctx = this._canvas.getContext("2d"));
  }
  /**
   * Starts the processing loop (draws source -> canvas -> user video).
   * @private
   */
  _startProcessing() {
    this._animationId && cancelAnimationFrame(this._animationId);
    const e = () => {
      if (!(!this._ctx || !this._sourceVideo)) {
        if (this._ctx.filter = this.currentFilter, this._ctx.drawImage(this._sourceVideo, 0, 0, this._canvas.width, this._canvas.height), this._ctx.filter = "none", this.watermarkText) {
          this._ctx.font = "bold 40px Arial";
          const s = this._ctx.measureText(this.watermarkText), i = 10, r = this._canvas.width - s.width - i * 2, a = this._canvas.height - 40 - i * 2;
          this._ctx.fillStyle = "rgba(0, 0, 0, 0.5)", this._ctx.fillRect(r, a, s.width + i * 2, 40 + i * 2), this._ctx.fillStyle = "white", this._ctx.textAlign = "left", this._ctx.textBaseline = "top", this._ctx.fillText(this.watermarkText, r + i, a + i);
        }
        this._animationId = requestAnimationFrame(e);
      }
    };
    e(), this.canvasStream = this._canvas.captureStream(this.config.frameRate), this.stream.getAudioTracks().length > 0 && this.stream.getAudioTracks().forEach((t) => {
      this.canvasStream.addTrack(t);
    }), this.videoElement.srcObject = this.canvasStream, this.videoElement.muted = !0, this.videoElement.autoplay = !0;
  }
  async startCamera() {
    return this._initProcessor(), new Promise(async (e, t) => {
      const s = {
        video: { width: { ideal: this.config.videoWidth }, height: { ideal: this.config.videoHeight } },
        audio: !0
      };
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(s), this._sourceVideo.srcObject = this.stream, this._sourceVideo.onloadedmetadata = () => {
          this._sourceVideo.play().then(() => {
            this._startProcessing(), this._emit("stream-ready", this.canvasStream), e(this.canvasStream);
          }).catch((i) => {
            this._log("Source video play failed: " + i.message), t(i);
          });
        }, this._log("Camera started successfully.");
      } catch (i) {
        this._log("Error starting camera: " + i.message), t(i);
      }
    });
  }
  async startScreen() {
    return this._initProcessor(), new Promise(async (e, t) => {
      const s = { video: !0, audio: !0 }, i = async (r) => {
        this.stream = await navigator.mediaDevices.getDisplayMedia(r), this._sourceVideo.srcObject = this.stream, this._sourceVideo.onloadedmetadata = () => {
          this._sourceVideo.play().then(() => {
            this._startProcessing(), this._emit("stream-ready", this.canvasStream), e(this.canvasStream);
          }).catch((a) => {
            this._log("Source video play failed: " + a.message);
          });
        };
      };
      try {
        await i(s), this._log("Screen started successfully.");
      } catch {
        this._log("Screen audio failed, retrying video only...");
        try {
          await i({ video: !0, audio: !1 });
        } catch (a) {
          t(a);
        }
      }
    });
  }
  startRecording() {
    if (!this.canvasStream) throw new Error("[VideoRecorderJS] No active stream.");
    this.chunks = [];
    let e = { mimeType: this.config.mimeType };
    MediaRecorder.isTypeSupported(e.mimeType) || (console.warn(`[VideoRecorderJS] ${e.mimeType} not supported.`), e = {}), this.mediaRecorder = new MediaRecorder(this.canvasStream, e), this.mediaRecorder.ondataavailable = (t) => {
      t.data.size > 0 && (this.chunks.push(t.data), this._emit("dataavailable", t.data));
    }, this.mediaRecorder.onstop = () => {
      const t = this.mediaRecorder.mimeType || "video/webm", s = t.includes("mp4") ? "mp4" : "webm", i = new Blob(this.chunks, { type: t });
      this._emit("stop", {
        blob: i,
        url: URL.createObjectURL(i),
        type: "video",
        mimeType: t,
        extension: s
      }), this._log("Recording stopped."), this._animationId && cancelAnimationFrame(this._animationId);
    }, this.mediaRecorder.start(), this._log("Recording started."), this.stream.getTracks().forEach((t) => {
      t.onended = () => {
        this._log("Stream track ended."), this.stopRecording();
      };
    });
  }
  stopRecording() {
    this.mediaRecorder && (this.mediaRecorder.state !== "inactive" && this.mediaRecorder.stop(), this.stream && (this.stream.getTracks().forEach((e) => e.stop()), this._emit("stream-ended", {})));
  }
}
export {
  d as default
};
