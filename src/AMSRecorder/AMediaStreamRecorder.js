/**
 * Created by imal365 on 3/7/18.
 */

var AMediaStreamRecorder = function (mediaStream, configs) {
    IVideoRecorder.call(this);
    var logger = new Logger();

    var DEFAULT_QUALITY = 1;
    var DEFAULT_WEBPQUALITY = 0.8;
    var DEFAULT_FRAMERATE = 25;
    var DEFAULT_RECORD_STERIO = false;
    var DEFAULT_SAMPLE_RATE = 44100;

    this.logger = new Logger();
    this.logger.info("Using AMeidaStreamRecorder");

    this.quality = parseFloat(UtilityHelper.getValue(configs.resize, DEFAULT_QUALITY));
    this.webp_quality = parseFloat(UtilityHelper.getValue(configs.webpquality, DEFAULT_WEBPQUALITY));
    this.framerate = parseInt(UtilityHelper.getValue(configs.framerate, DEFAULT_FRAMERATE));
    this.startTime = null;
    this.endTime = null;
    this.size = 0;
    var recordSterio = UtilityHelper.getValue(configs.recordSterio, DEFAULT_RECORD_STERIO);
    var sampleRate = UtilityHelper.getValue(configs.sampleRate, DEFAULT_SAMPLE_RATE);
    var videoElement = configs.videoElement;

    logger.debug("Quality "+this.quality );
    logger.debug("WEBP Quality "+this.webp_quality );
    logger.debug("framerate "+this.framerate );

    var self = this;

    this.audioRecorder = new AudioRecorder(mediaStream, recordSterio, sampleRate);
    this.videoRecorder = new VideoCopier(videoElement, {
        quality: self.quality,
        framerate: self.framerate,
        webp_quality: self.webp_quality
    });

};

AMediaStreamRecorder.prototype = Object.create(IVideoRecorder.prototype);
AMediaStreamRecorder.prototype.constructor = AMediaStreamRecorder;


AMediaStreamRecorder.prototype.start = function () {
    this.size = 0;
    this.startTime = new Date().getTime();
    this.audioRecorder.start();
    this.videoRecorder.startCapture();
};

AMediaStreamRecorder.prototype.stop = function () {
    this.endTime = new Date().getTime();
    this.audioRecorder.stop();
    this.videoRecorder.stopCapture();
    this.logger.debug("Duration : " + this.getDuration())
};

AMediaStreamRecorder.prototype.requestBlob = function () {
    var self = this;
    return new Promise(function (resolve) {
        var vblobInfo = self.videoRecorder.getBlob();
        self.audioRecorder.requestBlob().then(function (ablobinfo) {
            self.size = ablobinfo.blob.size + vblobInfo.blob.size;
            resolve([
                {type: "audio", blob: ablobinfo.blob, extension: ablobinfo.extension},
                {type: "video", blob: vblobInfo.blob, extension: vblobInfo.extension}
            ]);
        });
    });
};

AMediaStreamRecorder.prototype.getDuration = function () {
    return parseInt((this.endTime - this.startTime) / 1000);
};

AMediaStreamRecorder.prototype.getTotalSizeMB = function () {
    return Math.ceil(this.size/(1024*1024));
};

AMediaStreamRecorder.prototype.getType = function () {
    return IVideoRecorder.MSR;
};

