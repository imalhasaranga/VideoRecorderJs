/**
 * Created by imal365 on 3/7/18.
 */

var MediaStreamRecorder = function (mediaStream) {
    IVideoRecorder.call(this);
    this.logger = new Logger();
    this.logger.info("Using MeidaStreamRecorder");

    this.recorder = new MediaRecorder(mediaStream);
    this.chunks = [];
    this.stopPromise = null;

    var self = this;
    self.recorder.ondataavailable = function (e) {
        self.chunks.push(e.data);
    };

    self.stopPromise = new Promise(function (resolve) {
        self.recorder.onstop = function (e) {
            var recordedBlob = new Blob(self.chunks, {'type': MediaStreamRecorder.getSupportedMIMEType()});
            resolve(recordedBlob);
        }
    });


};

MediaStreamRecorder.prototype = Object.create(IVideoRecorder.prototype);
MediaStreamRecorder.prototype.constructor = MediaStreamRecorder;

MediaStreamRecorder.prototype.start = function () {
    this.logger.debug("MSR recording start");
    this.chunks = [];
    this.recorder.start();
};

MediaStreamRecorder.prototype.stop = function () {
    this.logger.debug("MSR recording stop");
    if (this.recorder.state != "inactive") {
        this.recorder.stop();
    }
};

MediaStreamRecorder.prototype.requestBlob = function () {
    this.logger.debug("MSR requesting recorded blob...");
    var self = this;
    return new Promise(function (resolve, reject) {
        self.stopPromise && self.stopPromise.then(function (blob) {
            resolve([{type: "video", blob: blob, extension: "webm"}]);
        })
    });
};

MediaStreamRecorder.prototype.getType = function () {
    this.logger.debug("MSR getType : " + IVideoRecorder.MSR);
    return IVideoRecorder.MSR;
};


MediaStreamRecorder.getSupportedMIMEType = function () {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        return 'video/webm; codecs=vp9'
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        return 'video/webm; codecs=vp8'
    } else {
        return 'video/webm';
    }
};