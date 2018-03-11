/**
 * Created by imal365 on 3/11/18.
 */
var NetworkWebpProcessor = function (params) {
    IFProcessor.call(this);
    this.logger = new Logger();
    this.logger.debug("Frame Processing Strategy : "+NetworkWebpProcessor.name);
};

NetworkWebpProcessor.prototype = Object.create(IFProcessor.prototype);
NetworkWebpProcessor.constructor = NetworkWebpProcessor;

NetworkWebpProcessor.prototype.prepare = function () {

};

NetworkWebpProcessor.prototype.processFrame = function (canvas) {
    //canvas.toDataURL()
};

NetworkWebpProcessor.prototype.getBlob = function (frameRateResolverFunction) {
    var self = this;
    var frameRate = frameRateResolverFunction(self.webpFrameArray.length);
    return new Promise(function (resolve) {
        var blob = new Whammy.fromImageArray(self.frames, frameRate);
        resolve(blob);
    });
};