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
export default class VideoRecorderJS {
    /**
     * @param {Object} config - Configuration object
     * @param {string|HTMLVideoElement} config.videoTagId - ID of the video element or the element itself.
     * @param {boolean} [config.log=false] - Enable debug logging.
     * @param {number} [config.videoWidth=640] - Desired video width.
     * @param {number} [config.videoHeight=480] - Desired video height.
     * @param {string} [config.mimeType='video/webm'] - Desired MIME type for recording.
     */
    constructor(config = {}) {
        // Backwards compatibility handling
        if (config.videotagid) console.warn('[VideoRecorderJS] "videotagid" is deprecated. Use "videoTagId".');
        if (config.framerate) console.warn('[VideoRecorderJS] "framerate" is deprecated. Use "frameRate".');

        this.config = {
            frameRate: config.frameRate || config.framerate || 30,
            videoTagId: config.videoTagId || config.videotagid,
            videoWidth: config.videoWidth || 640,
            videoHeight: config.videoHeight || 480,
            log: config.log || false,
            mimeType: config.mimeType || 'video/webm'
        };

        this.mediaRecorder = null;
        this.stream = null; // The raw stream from camera/screen
        this.canvasStream = null; // The processed stream from canvas
        this.chunks = [];
        
        // UI Elements
        this.videoElement = null; // User's visible video element
        this._sourceVideo = null; // Internal hidden video for raw stream
        this._canvas = null; // Internal canvas for processing
        this._ctx = null;
        this._animationId = null;

        // State for filters/effects
        this.currentFilter = 'none';
        this.watermarkText = '';

        // Support both ID string and direct HTMLElement
        if (typeof this.config.videoTagId === 'string') {
            this.videoElement = document.getElementById(this.config.videoTagId);
        } else if (this.config.videoTagId instanceof HTMLVideoElement) {
            this.videoElement = this.config.videoTagId;
        }

        if (!this.videoElement) {
            throw new Error(`[VideoRecorderJS] Video element not found.`);
        }

        this.events = {
            'stream-ready': [],
            'stop': [],
            'dataavailable': [],
            'stream-ended': []
        };
    }

    /**
     * Attach an event listener.
     */
    on(event, callback) {
        if (this.events[event]) this.events[event].push(callback);
    }

    _emit(event, data) {
        if (this.events[event]) this.events[event].forEach(cb => cb(data));
    }

    _log(message) {
        if (this.config.log) console.log(`[VideoRecorderJS] ${message}`);
    }

    /**
     * Sets a CSS filter for the video.
     * @param {string} filter - CSS filter string (e.g., 'grayscale(100%)', 'sepia(100%)', 'blur(5px)', 'none')
     */
    setFilter(filter) {
        this.currentFilter = filter || 'none';
        this._log(`Filter set to: ${this.currentFilter}`);
    }

    /**
     * Sets a watermark text overlay.
     * @param {string} text - Text to display. Set empty string to remove.
     */
    setWatermark(text) {
        this.watermarkText = text;
        this._log(`Watermark set to: ${this.watermarkText}`);
    }

    /**
     * Initialize the canvas processor.
     * Creates an internal video element to play the raw stream,
     * and a canvas to draw the processed frames.
     * @private
     */
    _initProcessor() {
        if (!this._sourceVideo) {
            this._sourceVideo = document.createElement('video');
            this._sourceVideo.muted = true;
            this._sourceVideo.autoplay = true;
            this._sourceVideo.playsInline = true;
        }

        if (!this._canvas) {
            this._canvas = document.createElement('canvas');
            this._canvas.width = this.config.videoWidth;
            this._canvas.height = this.config.videoHeight;
            this._ctx = this._canvas.getContext('2d');
        }
    }

    /**
     * Starts the processing loop (draws source -> canvas -> user video).
     * @private
     */
    _startProcessing() {
        if (this._animationId) cancelAnimationFrame(this._animationId);

        const drawInfo = () => {
            if (!this._ctx || !this._sourceVideo) return;

            // Draw video frame
            this._ctx.filter = this.currentFilter;
            this._ctx.drawImage(this._sourceVideo, 0, 0, this._canvas.width, this._canvas.height);
            this._ctx.filter = 'none'; // Reset filter for text

            // Draw Watermark
            if (this.watermarkText) {
                const fontSize = 40;
                this._ctx.font = `bold ${fontSize}px Arial`;
                const textMetrics = this._ctx.measureText(this.watermarkText);
                const padding = 10;
                
                // Position: Bottom Right
                const x = this._canvas.width - textMetrics.width - (padding * 2);
                const y = this._canvas.height - fontSize - (padding * 2);

                // Draw Background Box
                this._ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
                this._ctx.fillRect(x, y, textMetrics.width + (padding * 2), fontSize + (padding * 2));

                // Draw Text
                this._ctx.fillStyle = 'white';
                this._ctx.textAlign = 'left'; // Reset alignment for simpler box calculation
                this._ctx.textBaseline = 'top';
                this._ctx.fillText(this.watermarkText, x + padding, y + padding);
            }

            this._animationId = requestAnimationFrame(drawInfo);
        };
        drawInfo();

        // Capture stream from canvas for recording & display
        this.canvasStream = this._canvas.captureStream(this.config.frameRate);
        
        // If the raw stream has audio, add it to the canvas stream so recording has sound
        if (this.stream.getAudioTracks().length > 0) {
            this.stream.getAudioTracks().forEach(track => {
                this.canvasStream.addTrack(track);
            });
        }

        // Show the PROCESSED stream to the user
        this.videoElement.srcObject = this.canvasStream;
        this.videoElement.muted = true;
        this.videoElement.autoplay = true;
    }

    async startCamera() {
        this._initProcessor();
        return new Promise(async (resolve, reject) => {
            const constraints = {
                video: { width: { ideal: this.config.videoWidth }, height: { ideal: this.config.videoHeight } },
                audio: true
            };

            try {
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                this._sourceVideo.srcObject = this.stream;
                
                // Wait for source video to be ready before processing
                this._sourceVideo.onloadedmetadata = () => {
                    this._sourceVideo.play().then(() => {
                        this._startProcessing();
                        this._emit('stream-ready', this.canvasStream);
                        resolve(this.canvasStream);
                    }).catch(e => {
                        this._log('Source video play failed: ' + e.message);
                        reject(e);
                    });
                };
                this._log('Camera started successfully.');
            } catch (error) {
                this._log('Error starting camera: ' + error.message);
                reject(error);
            }
        });
    }

    async startScreen() {
        this._initProcessor();
        return new Promise(async (resolve, reject) => {
            const constraints = { video: true, audio: true };
            
            const startStream = async (consts) => {
                this.stream = await navigator.mediaDevices.getDisplayMedia(consts);
                this._sourceVideo.srcObject = this.stream;
                this._sourceVideo.onloadedmetadata = () => {
                    this._sourceVideo.play().then(() => {
                        this._startProcessing();
                        this._emit('stream-ready', this.canvasStream);
                        resolve(this.canvasStream);
                    }).catch(e => {
                        this._log('Source video play failed: ' + e.message);
                        // Don't reject here for screen share, might still be barely working
                    });
                };
            };

            try {
                await startStream(constraints);
                this._log('Screen started successfully.');
            } catch (error) {
                 this._log('Screen audio failed, retrying video only...');
                 try {
                    await startStream({ video: true, audio: false });
                 } catch (err) {
                     reject(err);
                 }
            }
        });
    }

    startRecording() {
        if (!this.canvasStream) throw new Error('[VideoRecorderJS] No active stream.');

        this.chunks = [];
        let options = { mimeType: this.config.mimeType };
        
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.warn(`[VideoRecorderJS] ${options.mimeType} not supported.`);
            options = {};
        }

        // Record from the CANVAS stream (which has filters/watermark + audio)
        this.mediaRecorder = new MediaRecorder(this.canvasStream, options);

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.chunks.push(e.data);
                this._emit('dataavailable', e.data);
            }
        };

        this.mediaRecorder.onstop = () => {
             const finalMimeType = this.mediaRecorder.mimeType || 'video/webm';
             const ext = finalMimeType.includes('mp4') ? 'mp4' : 'webm';
             const blob = new Blob(this.chunks, { type: finalMimeType });

             this._emit('stop', {
                 blob: blob,
                 url: URL.createObjectURL(blob),
                 type: 'video',
                 mimeType: finalMimeType,
                 extension: ext
             });
             this._log('Recording stopped.');
             
             // Stop animation loop
             if (this._animationId) cancelAnimationFrame(this._animationId);
        };

        this.mediaRecorder.start();
        this._log(`Recording started.`);
        
        this.stream.getTracks().forEach(track => {
            track.onended = () => {
                this._log('Stream track ended.');
                this.stopRecording();
            };
        });
    }

    stopRecording() {
        if (!this.mediaRecorder) return;
        
        if (this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this._emit('stream-ended', {}); 
        }
    }
}
