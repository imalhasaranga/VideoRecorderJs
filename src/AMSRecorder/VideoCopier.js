/**
 * Created by imal365 on 3/7/18.
 */

var VideoCopier = function (videoElement, config) {
    this.logger = new Logger();
    this.videoElement = videoElement;
    this.recrodinterval = null;

    this.quality = config.quality ? config.quality : 1.0;
    this.framerate = config.framerate ? config.framerate : 30;
    this.webp_quality = config.webp_quality ? config.webp_quality : 1.0;
    this.timer = parseInt(1000 / this.framerate);

    this.logger.debug("Timer : "+this.timer);

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext('2d');
    var self = this;

    this.fixHeights = function () {
        self.logger.debug("ReadyState :" + self.videoElement.readyState);
        self.newWidth = self.canvas.width = parseInt(self.quality * self.videoElement.clientWidth);
        self.newHeight = self.canvas.height = parseInt(self.quality * self.videoElement.clientHeight);
    };

    if (this.videoElement.readyState == 4) {
        this.fixHeights();
    } else {
        this.videoElement.onloadeddata = this.fixHeights;
    }

    this.ifProcessor = new LocalWebpProcessor('src/worker.js',3);
    //this.ifProcessor = new DirectWebpProcessor(this.webp_quality);

};

VideoCopier.prototype.startCapture = function () {
    var self = this;
    this.startTime = new Date().getTime();
    this.reset();
    this.ifProcessor.prepare();
    this.recrodinterval = setInterval(function () {
        if (self.videoElement.readyState === 4) {
            self.ctx.drawImage(self.videoElement, 0, 0, self.newWidth, self.newHeight);
            self.ifProcessor.processFrame(self.canvas,self.ctx);
        }
    }, this.timer);
};

VideoCopier.prototype.stopCapture = function () {
    var self = this;
    this.videoBlob = null;
    this.reset();
    this.endTime = new Date().getTime();
    var elapsed = (this.endTime - this.startTime)/1000;
    var blobPromise = this.ifProcessor.getBlob(function (framecount) {
        var calCulatedFrameRate = parseInt(framecount/elapsed);
        self.logger.debug("[Expected,Actual] Frame Rate  : ["+ self.framerate+","+calCulatedFrameRate+"]");
        if(self.framerate == calCulatedFrameRate){
            self.logger.debug("Actual and Expected Frame count matches, so using Expected Frame Rate");
            return self.framerate;
        }
        self.logger.debug("Calculated Frame Rate and Actual Frame Rate does not match Using Calculated Frame Rate");
        return calCulatedFrameRate;
    });
    return new Promise(function (resolve) {
        blobPromise.then(function (blob) {
            resolve({blob: blob });
        });
    });
};

VideoCopier.prototype.getBlob = function () {


};

VideoCopier.prototype.reset = function () {
    this.recrodinterval && clearInterval(this.recrodinterval);
};
