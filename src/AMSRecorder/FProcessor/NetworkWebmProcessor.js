/**
 * Created by imal365 on 3/11/18.
 */
var NetworkWebmProcessor = function (params) {
    IFProcessor.call(this);
    this.logger = new Logger();
    this.logger.debug("Frame Processing Strategy : "+NetworkWebmProcessor.name);
};

NetworkWebmProcessor.prototype = Object.create(IFProcessor.prototype);
NetworkWebmProcessor.constructor = NetworkWebmProcessor;

NetworkWebmProcessor.prototype.prepare = function () {

};

NetworkWebmProcessor.prototype.processFrame = function (canvas) {
    //canvas.toDataURL()
    //canvas.toBlob();
};

NetworkWebmProcessor.prototype.getBlob = function (frameRateResolverFunction) {
    var self = this;
    var frameRate = frameRateResolverFunction(self.webpFrameArray.length);
    return new Promise(function (resolve) {

    });
};