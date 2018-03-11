/**
 * Created by imal365 on 3/11/18.
 */
var NetworkWebpProcessor = function (params) {
    IFProcessor.call(this);
};

NetworkWebpProcessor.prototype = Object.create(IFProcessor.prototype);
NetworkWebpProcessor.constructor = NetworkWebpProcessor;


NetworkWebpProcessor.prototype.processFrame = function (canvas) {
    //canvas.toDataURL()
};

NetworkWebpProcessor.prototype.getBlob = function (frameRateResolverFunction) {
    var self = this;
    var frameRate = frameRateResolverFunction(self.webpFrameArray.length);
    return new Promise(function (resolve) {
       //logic
    });
};