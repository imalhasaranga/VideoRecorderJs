/**
 * Created by imal365 on 3/11/18.
 */
var NetworkWebmProcessor = function (params) {
    IFProcessor.call(this);
    this.logger = new Logger();
    this.logger.debug("Frame Processing Strategy : "+NetworkWebmProcessor.name);
    this.net = new NetworkManager({
        batchSize : 50
    });
    this.net.init();
    this.count = 1;
};

NetworkWebmProcessor.prototype = Object.create(IFProcessor.prototype);
NetworkWebmProcessor.constructor = NetworkWebmProcessor;

NetworkWebmProcessor.prototype.prepare = function () {

};

NetworkWebmProcessor.prototype.processFrame = function (canvas) {
    this.net.pushFrame(canvas.toDataURL(), this.count);
    this.count += 1;
};

NetworkWebmProcessor.prototype.getBlob = function (frameRateResolverFunction) {
    var self = this;
    var frameRate = frameRateResolverFunction(this.count);
    console.log("frame rate "+ frameRate);
    return new Promise(function (resolve) {
        self.net.encode(frameRate, function(video){
            resolve(video);
        });
    });
};