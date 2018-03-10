/**
 * Created by imal365 on 3/7/18.
 */

var VideoCopier = function (videoElement, config) {
    this.logger = new Logger();
    this.videoElement = videoElement;
    this.recrodinterval = null;
    this.workerPool = new WorkerPool('src/worker.js',5);


    this.counter = 0;
    this.onMessageCounter = 0;

    this.frames = [];
    this.quality = config.quality ? config.quality : 1.0;
    this.framerate = config.framerate ? config.framerate : 30;
    this.webp_quality = config.webp_quality ? config.webp_quality : 1.0;
    this.timer = parseInt(1000 / this.framerate);

    this.logger.debug("Quality : "+this.quality);
    this.logger.debug("FrameRate : "+this.framerate);
    this.logger.debug("WebP Quality : "+this.webp_quality);
    this.logger.debug("Timer : "+this.timer);

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext('2d');
    var self = this;

    this.logger.debug("ReadyState :" + this.videoElement.readyState);
    if (this.videoElement.readyState == 4) {
        self.newWidth = self.canvas.width = parseInt(self.quality * self.videoElement.clientWidth);
        self.newHeight = self.canvas.height = parseInt(self.quality * self.videoElement.clientHeight);
    } else {
        this.videoElement.onloadeddata = function () {
            self.logger.debug("ReadyState :" + self.videoElement.readyState);
            self.newWidth = self.canvas.width = parseInt(self.quality * self.videoElement.clientWidth);
            self.newHeight = self.canvas.height = parseInt(self.quality * self.videoElement.clientHeight);
        };
    }

    this.dataReadyPromise = null;

};

VideoCopier.prototype.startCapture = function () {
    var self = this;
    this.startTime = new Date().getTime();
    this.counter = 0;
    this.gap = 10000;
    this.reset();

    this.dataReadyPromise = new Promise(function (resolve, reject) {
        self.workerPool.onmessage(function (e) {
            ++self.onMessageCounter;
            self.frames[e.data.index-1] = e.data.dataurl;
            self.logger.debug("data recevided : " + e.data.dataurl.length + "["+self.gap +","+self.counter+","+ self.onMessageCounter+"]");
            if ((self.counter+self.gap) == self.onMessageCounter) {
                self.logger.debug("------------------------------------------------------------------------------");
                var timeex = fixTime( (new Date().getTime() - self.startTime) / (1000));
                self.logger.debug("Time took to process : " + timeex+"s");
                self.logger.debug("------------------------------------------------------------------------------");
                resolve();
            }
        });
    });

    this.recrodinterval = setInterval(function () {
        if (self.videoElement.readyState === 4) {
            ++self.counter;
            self.ctx.drawImage(self.videoElement, 0, 0, self.newWidth, self.newHeight);
            //var webpqual = (self.webp_quality == 1.0) ? null : self.webp_quality;
            //self.frames.push(self.canvas.toDataURL('image/webp', webpqual));
            var image = self.ctx.getImageData(0, 0, self.newWidth, self.newHeight);
            self.workerPool.postMessage([image,self.counter]);
            //self.logger.debug("counter "+self.counter);

        }
    }, this.timer);
};

VideoCopier.prototype.stopCapture = function () {
    var self = this;
    this.videoBlob = null;
    if (this.dataReadyPromise) {
        return new Promise(function (resolve) {
            self.recrodinterval && clearInterval(self.recrodinterval);
            self.gap = 0;
            var spentTime = (new Date().getTime() - self.startTime) / 1000;
            self.dataReadyPromise.then(function () {
                self.logger.debug("Frame count that is still processing : " + this.counter);
                if (self.frames.length > 0) {
                    var localframerate = parseInt(self.frames.length / spentTime);
                    self.logger.debug("Frame count : " + self.frames.length);
                    self.logger.debug("method calls count : " + self.methodCallCounter);
                    self.videoBlob = new Whammy.fromImageArray(self.frames, localframerate);
                    resolve(self.videoBlob);
                }
            });
        });
    }
};

VideoCopier.prototype.getBlob = function () {
    var blob = this.videoBlob;
    this.videoBlob = null;
    this.reset();
    return {blob: blob, mimeType: "video/webm", extension: "webm"};
};

VideoCopier.prototype.reset = function () {
    this.frames = [];
    this.recrodinterval && clearInterval(this.recrodinterval);
};


function fixTime(timeex) {
    var minutes = Math.floor(timeex / 60);
    var seconds = timeex - minutes * 60;
    return minutes +":"+seconds;
}

