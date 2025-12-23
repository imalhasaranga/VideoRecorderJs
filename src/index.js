export class VideoRecorderJS {
    constructor(options = {}) {
        this.config = {
            resize: options.resize || 1,
            webpQuality: options.webpquality || 1.0,
            frameRate: options.framerate || 30,
            videoTagId: options.videotagid,
            videoWidth: options.videoWidth || 640,
            videoHeight: options.videoHeight || 480,
            log: options.log || false,
            mimeType: options.mimeType || 'video/webm'
        };

        this.mediaRecorder = null;
        this.stream = null;
        this.chunks = [];
        this.videoElement = document.getElementById(this.config.videoTagId);

        if (!this.videoElement) {
            throw new Error(`Video element with ID '${this.config.videoTagId}' not found.`);
        }

        this.events = {
            'stream-ready': [],
            'stream-error': [],
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
        try {
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
        } catch (err) {
            this.emit('stream-error', err);
            console.error('Error accessing camera:', err);
        }
    }

    async startScreen() {
        try {
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
        } catch (err) {
            this.emit('stream-error', err);
            console.error('Error accessing screen:', err);
        }
    }

    startRecording() {
        if (!this.stream) {
            console.error('No stream to record. Call startCamera() or startScreen() first.');
            return;
        }

        this.chunks = [];
        let options = { mimeType: this.config.mimeType };
        
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.warn(`${options.mimeType} is not supported, falling back to default.`);
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
             const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType || 'video/webm' });
             this.emit('stop', {
                 blob: blob,
                 url: URL.createObjectURL(blob),
                 type: 'video'
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
