/**
 * Created by imal365 on 3/7/18.
 */

var VideoCopier = function (videoElement,config) {
    this.logger = new Logger();
    this.videoElement = videoElement;
    this.recrodinterval = null;

    this.frames = [];
    this.quality = config.quality ? config.quality : 1.0;
    this.framerate = config.framerate ? config.framerate : 30;
    this.webp_quality = config.webp_quality ? config.webp_quality : 1.0;

    this.timer = parseInt(1000 / this.framerate);
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext('2d');
    var self = this;

    this.logger.debug("ReadyState :"+this.videoElement.readyState );
    if(this.videoElement.readyState == 4){
        self.newWidth = self.canvas.width = parseInt(self.quality * self.videoElement.clientWidth);
        self.newHeight = self.canvas.height = parseInt(self.quality * self.videoElement.clientHeight);
    }else{
        this.videoElement.onloadeddata = function () {
            self.logger.debug("ReadyState :"+self.videoElement.readyState );
            self.newWidth = self.canvas.width = parseInt(self.quality * self.videoElement.clientWidth);
            self.newHeight = self.canvas.height = parseInt(self.quality * self.videoElement.clientHeight);
        };
    }

};

VideoCopier.prototype.startCapture = function () {
    var self = this;
    this.reset();
    this.startTime = new Date().getTime();
    this.recrodinterval = setInterval(function () {
        if(self.videoElement.readyState === 4) {
            self.ctx.drawImage(self.videoElement, 0, 0, self.newWidth, self.newHeight);
            var webpqual = (self.webp_quality == 1.0) ? null : self.webp_quality;
            self.frames.push(self.canvas.toDataURL('image/webp', webpqual));
        }
    }, this.timer);
};

VideoCopier.prototype.stopCapture = function () {
    this.videoBlob = null;
    if(this.frames.length > 0) {
        this.recrodinterval && clearInterval(this.recrodinterval);
        var spentTime = (new Date().getTime() - this.startTime) / 1000;
        var localframerate = parseInt(this.frames.length / spentTime);
        this.videoBlob = new Whammy.fromImageArray(this.frames, localframerate);
    }
    return this.videoBlob;
};

VideoCopier.prototype.getBlob = function () {
    var blob = this.videoBlob;
    this.videoBlob = null;
    this.reset();
    return {blob : blob, mimeType : "video/webm" , extension : "webm"};
};

VideoCopier.prototype.reset = function () {
    this.frames = [];
    this.recrodinterval && clearInterval(this.recrodinterval);
};


