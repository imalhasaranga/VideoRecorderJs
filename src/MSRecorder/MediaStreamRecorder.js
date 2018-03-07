/**
 * Created by imal365 on 3/7/18.
 */

var MediaStreamRecorder = function (mediaStream) {
    IVideoRecorder.call(this);
    this.logger = new Logger();
    this.logger.info("Using MeidaStreamRecorder");

    this.recorder = new MediaRecorder(mediaStream);
    this.chunks = [];
    this.recordedBlob = null;
    this.stopPromise = null;

    var self = this;
    self.recorder.ondataavailable = function (e) {
        self.chunks.push(e.data);
    };
    self.recorder.onstop = function (e) {
        self.stopPromise = new Promise(function (resolve) {
            self.recordedBlob = new Blob(self.chunks, {'type': MediaStreamRecorder.getSupportedMIMEType()});
            resolve(self.recordedBlob);
        });
    }

};

MediaStreamRecorder.prototype.start = function () {
    this.chunks = [];
    this.recordedBlob = null;
    this.recorder.start();
};

MediaStreamRecorder.prototype.stop = function () {
    if (this.recorder.state != "inactive") {
        this.recorder.stop();
    }
};

MediaStreamRecorder.prototype.requestBlob = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        if (self.recordedBlob) {
            resolve(self.recordedBlob);
        } else {
            self.stopPromise && self.stopPromise.then(function (blob) {
                resolve(blob);
            })
        }
    });
};

MediaStreamRecorder.prototype.getType = function () {
    return IVideoRecorder.MSR;
};


MediaStreamRecorder.prototype = Object.create(IVideoRecorder.prototype);
MediaStreamRecorder.prototype.constructor = MediaStreamRecorder;

MediaStreamRecorder.getSupportedMIMEType = function () {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        return {mimeType: 'video/webm; codecs=vp9'};
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        return {mimeType: 'video/webm; codecs=vp8'};
    } else {
        return {mimeType: 'video/webm'};
    }
};