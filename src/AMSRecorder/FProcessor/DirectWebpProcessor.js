/**
 * Created by imal365 on 3/11/18.
 */
var DirectWebpProcessor = function (webp_quality) {
    IFProcessor.call(this);
    this.webp_quality = (webp_quality != null && webp_quality < 1) ? webp_quality : null;
    this.webpFrameArray = [];
};

DirectWebpProcessor.prototype = Object.create(IFProcessor.prototype);
DirectWebpProcessor.constructor = DirectWebpProcessor;


DirectWebpProcessor.prototype.processFrame = function (canvas) {
    this.webpFrameArray.push(canvas.toDataURL('image/webp', this.webp_quality));
};

DirectWebpProcessor.prototype.getBlob = function (frameRateResolverFunction) {
    var self = this;
    var frameRate = frameRateResolverFunction(self.webpFrameArray.length);
    return new Promise(function (resolve) {
        var blob = new Whammy.fromImageArray(self.webpFrameArray, frameRate);
        resolve(blob);
    });
};


