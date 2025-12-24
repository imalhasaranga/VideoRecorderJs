export class VideoRecorderJS {
    constructor(options = {}) {
        // Backwards compatibility handling
        if (options.videotagid) {
            console.warn('[VideoRecorderJS] Deprecation Warning: "videotagid" is deprecated. Use "videoTagId" instead.');
        }
        if (options.framerate) {
            console.warn('[VideoRecorderJS] Deprecation Warning: "framerate" is deprecated. Use "frameRate" instead.');
        }
        if (options.webpquality) {
            console.warn('[VideoRecorderJS] Deprecation Warning: "webpquality" is deprecated. Use "webpQuality" instead.');
        }

        this.config = {
            resize: options.resize || 1,
            webpQuality: options.webpQuality || options.webpquality || 1.0,
            frameRate: options.frameRate || options.framerate || 30,
            videoTagId: options.videoTagId || options.videotagid,
            videoWidth: options.videoWidth || 640,
            videoHeight: options.videoHeight || 480,
            log: options.log || false,
            mimeType: options.mimeType || 'video/webm'
        };

        this.mediaRecorder = null;
        this.stream = null;
        this.chunks = [];
        
        // Support both ID string and direct HTMLElement
        if (typeof this.config.videoTagId === 'string') {
            this.videoElement = document.getElementById(this.config.videoTagId);
        } else if (this.config.videoTagId instanceof HTMLVideoElement) {
            this.videoElement = this.config.videoTagId;
        }

        if (!this.videoElement) {
            throw new Error(`[VideoRecorderJS] Video element not found. Provide a valid ID string or HTMLVideoElement.`);
        }

        this.events = {
            'stream-ready': [],
            'stream-error': [], // Deprecated but kept empty to avoid crash if someone emits it
            'stop': [],
            'dataavailable': []
        };
    }

    on(event, callback) {
        if (this.events[event]) {
            this.events[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }

    log(message) {
        if (this.config.log) console.log(`[VideoRecorderJS] ${message}`);
    }

    async startCamera() {
        // v3.0.0: Replaces internal try/catch with direct Promise propagation
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: { ideal: this.config.videoWidth },
                height: { ideal: this.config.videoHeight }
            }
        });

        this.videoElement.srcObject = this.stream;
        this.videoElement.muted = true;
        this.videoElement.autoplay = true;

        this.emit('stream-ready', this.stream);
        this.log('Camera started successfully.');
    }

    async startScreen() {
        this.stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                width: { ideal: this.config.videoWidth },
                height: { ideal: this.config.videoHeight }
            },
            audio: true
        });

        this.videoElement.srcObject = this.stream;
        this.videoElement.autoplay = true;
        this.videoElement.muted = true; // Avoid feedback loop

        this.emit('stream-ready', this.stream);
        this.log('Screen sharing started successfully.');
    }

    startRecording() {
        if (!this.stream) {
            throw new Error('[VideoRecorderJS] No active stream. Call startCamera() or startScreen() first.');
        }

        this.chunks = [];
        let options = { mimeType: this.config.mimeType };
        
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.warn(`[VideoRecorderJS] ${options.mimeType} is not supported, falling back to default.`);
            options = {};
        }

        this.mediaRecorder = new MediaRecorder(this.stream, options);

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.chunks.push(e.data);
                this.emit('dataavailable', e.data);
            }
        };

        this.mediaRecorder.onstop = () => {
             const finalMimeType = this.mediaRecorder.mimeType || 'video/webm';
             const blob = new Blob(this.chunks, { type: finalMimeType });
             this.emit('stop', {
                 blob: blob,
                 url: URL.createObjectURL(blob),
                 type: 'video',
                 mimeType: finalMimeType
             });
             this.log('Recording stopped.');
        };

        this.mediaRecorder.start();
        this.log('Recording started.');
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            if(this.stream) {
                 this.stream.getTracks().forEach(track => track.stop());
            }
        }
    }
}

export default VideoRecorderJS;
