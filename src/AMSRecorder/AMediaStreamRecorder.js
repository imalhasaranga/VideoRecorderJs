/**
 * Created by imal365 on 3/7/18.
 */

var AMediaStreamRecorder = function (mediaStream,configs) {
    IVideoRecorder.call(this);

    var DEFAULT_QUALITY = 1;
    var DEFAULT_WEBPQUALITY = 1;
    var DEFAULT_FRAMERATE = 30;
    var DEFAULT_RECORD_STERIO = true;
    var DEFAULT_SAMPLE_RATE = 44100;

    this.logger = new Logger();
    this.logger.info("Using AMeidaStreamRecorder");

    this.quality = parseFloat(UtilityHelper.getValue(configs.resize,DEFAULT_QUALITY));
    this.webp_quality =  parseFloat(UtilityHelper.getValue(configs.webpquality,DEFAULT_WEBPQUALITY));
    this.framerate = parseInt(UtilityHelper.getValue(configs.framerate,DEFAULT_FRAMERATE));
    var recordSterio = UtilityHelper.getValue(configs.recordSterio,DEFAULT_RECORD_STERIO);
    var sampleRate = UtilityHelper.getValue(configs.sampleRate,DEFAULT_SAMPLE_RATE);
    var videoElement = configs.videoElement;
    var self = this;

    this.audioRecorder = new AudioRecorder(mediaStream,recordSterio,sampleRate);
    this.videoRecorder = new VideoCopier(videoElement,{
        quality : self.quality,
        framerate : self.framerate,
        webp_quality : self.webp_quality
    });
    
};

AMediaStreamRecorder.prototype.start = function () {
    this.audioRecorder.start();
    this.videoRecorder.startCapture();
};

AMediaStreamRecorder.prototype.stop = function () {
    this.audioRecorder.stop();
    this.videoRecorder.stopCapture();
};

AMediaStreamRecorder.prototype.requestBlob = function () {
    var self = this;
    return new Promise(function(resolve){
        var blobInfo = self.videoRecorder.getBlob();
        self.audioRecorder.requestBlob().then(function (blob, mime, extension) {
            resolve([
                { type: "audio", blob : blob,  mimeType : mime, extension : extension },
                { type: "video", blob : blobInfo.blob, mimeType : blobInfo.mimeType , extension : blobInfo.extension }
            ]);
        });
    });
};

AMediaStreamRecorder.prototype.getType = function () {
    return IVideoRecorder.MSR;
};


AMediaStreamRecorder.prototype = Object.create(IVideoRecorder.prototype);
AMediaStreamRecorder.prototype.constructor = AMediaStreamRecorder;
