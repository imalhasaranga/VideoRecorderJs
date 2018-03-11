/**
 * Created by imal365 on 3/11/18.
 */
var LocalWebpProcessor = function (workerPath, count) {
    IFProcessor.call(this);
    this.logger = new Logger();
    // this.workerPool = new WorkerPool('src/worker.js',5);
    this.counter = 0;
    this.onMessageCounter = 0;
    this.frames = [];
    this.dataReadyPromise = null;

    this.workerPool = new WorkerPool(workerPath, count);
};

LocalWebpProcessor.prototype = Object.create(IFProcessor.prototype);
LocalWebpProcessor.constructor = LocalWebpProcessor;


LocalWebpProcessor.prototype.prepare = function () {
    var self = this;
    this.counter = 0;
    this.onMessageCounter = 0;
    this.frames = [];

    this.dataReadyPromise = new Promise(function (resolve, reject) {
        self.workerPool.onmessage(function (e) {
            ++self.onMessageCounter;
            self.frames[e.data.index - 1] = e.data.dataurl;
            self.logger.debug("data recevided : " + e.data.dataurl.length + "[" + self.counter + "," + self.onMessageCounter + "]");
            if ((self.counter) == self.onMessageCounter) {
                self.logger.debug("------------------------------------------------------------------------------");
                var time = (new Date().getTime() - self.startTime) / (1000);
                var minutes = Math.floor(time / 60);
                var seconds = parseInt(time - minutes * 60);
                self.logger.debug("Time took to process : " + (minutes + ":" + seconds) + "s");
                self.logger.debug("------------------------------------------------------------------------------");
                resolve();
            }
        });
    });

};


LocalWebpProcessor.prototype.processFrame = function (canvas) {
    ++this.counter;
    var imageData = canvas.getImageData(0, 0, canvas.width, canvas.height);
    this.workerPool.postMessage([imageData, this.counter]);
};

LocalWebpProcessor.prototype.getWebpArray = function (frameRateResolverFunction) {
    var self = this;
    var frameRate = frameRateResolverFunction(self.frames.length);
    return new Promise(function (resolve) {
        self.dataReadyPromise.then(function () {
            var blob = new Whammy.fromImageArray(self.frames, frameRate);
            resolve(blob);
        });
    });
};
