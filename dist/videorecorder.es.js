class r {
  constructor(e = {}) {
    if (e.videotagid && console.warn('[VideoRecorderJS] Deprecation Warning: "videotagid" is deprecated. Use "videoTagId" instead.'), e.framerate && console.warn('[VideoRecorderJS] Deprecation Warning: "framerate" is deprecated. Use "frameRate" instead.'), e.webpquality && console.warn('[VideoRecorderJS] Deprecation Warning: "webpquality" is deprecated. Use "webpQuality" instead.'), this.config = {
      resize: e.resize || 1,
      webpQuality: e.webpQuality || e.webpquality || 1,
      frameRate: e.frameRate || e.framerate || 30,
      videoTagId: e.videoTagId || e.videotagid,
      videoWidth: e.videoWidth || 640,
      videoHeight: e.videoHeight || 480,
      log: e.log || !1,
      mimeType: e.mimeType || "video/webm"
    }, this.mediaRecorder = null, this.stream = null, this.chunks = [], typeof this.config.videoTagId == "string" ? this.videoElement = document.getElementById(this.config.videoTagId) : this.config.videoTagId instanceof HTMLVideoElement && (this.videoElement = this.config.videoTagId), !this.videoElement)
      throw new Error("[VideoRecorderJS] Video element not found. Provide a valid ID string or HTMLVideoElement.");
    this.events = {
      "stream-ready": [],
      "stream-error": [],
      // Deprecated but kept empty to avoid crash if someone emits it
      stop: [],
      dataavailable: []
    };
  }
  on(e, i) {
    this.events[e] && this.events[e].push(i);
  }
  emit(e, i) {
    this.events[e] && this.events[e].forEach((t) => t(i));
  }
  log(e) {
    this.config.log && console.log(`[VideoRecorderJS] ${e}`);
  }
  async startCamera() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: !0,
      video: {
        width: { ideal: this.config.videoWidth },
        height: { ideal: this.config.videoHeight }
      }
    }), this.videoElement.srcObject = this.stream, this.videoElement.muted = !0, this.videoElement.autoplay = !0, this.emit("stream-ready", this.stream), this.log("Camera started successfully.");
  }
  async startScreen() {
    this.stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: this.config.videoWidth },
        height: { ideal: this.config.videoHeight }
      },
      audio: !0
    }), this.videoElement.srcObject = this.stream, this.videoElement.autoplay = !0, this.videoElement.muted = !0, this.emit("stream-ready", this.stream), this.log("Screen sharing started successfully.");
  }
  startRecording() {
    if (!this.stream)
      throw new Error("[VideoRecorderJS] No active stream. Call startCamera() or startScreen() first.");
    this.chunks = [];
    let e = { mimeType: this.config.mimeType };
    MediaRecorder.isTypeSupported(e.mimeType) || (console.warn(`[VideoRecorderJS] ${e.mimeType} is not supported, falling back to default.`), e = {}), this.mediaRecorder = new MediaRecorder(this.stream, e), this.mediaRecorder.ondataavailable = (i) => {
      i.data.size > 0 && (this.chunks.push(i.data), this.emit("dataavailable", i.data));
    }, this.mediaRecorder.onstop = () => {
      const i = this.mediaRecorder.mimeType || "video/webm", t = new Blob(this.chunks, { type: i });
      this.emit("stop", {
        blob: t,
        url: URL.createObjectURL(t),
        type: "video",
        mimeType: i
      }), this.log("Recording stopped.");
    }, this.mediaRecorder.start(), this.log("Recording started.");
  }
  stopRecording() {
    this.mediaRecorder && this.mediaRecorder.state !== "inactive" && (this.mediaRecorder.stop(), this.stream && this.stream.getTracks().forEach((e) => e.stop()));
  }
}
export {
  r as VideoRecorderJS,
  r as default
};
