/**
 * Created by imal365 on 3/11/18.
 */
var NetworkWebpProcessor = function (params) {
    IFProcessor.call(this);
    this.logger = new Logger();
    this.logger.debug("Frame Processing Strategy : "+NetworkWebpProcessor.name);
    this.net = new NetworkManager({});
    this.net.init();
    this.count = 0;
    this.tempFrames = [];
    this.needToCreateVideo = false;
    this.resolve = null;
    this.fps = 25;
};

NetworkWebpProcessor.prototype = Object.create(IFProcessor.prototype);
NetworkWebpProcessor.constructor = NetworkWebpProcessor;

NetworkWebpProcessor.prototype.prepare = function () {

};

NetworkWebpProcessor.prototype.processFrame = function (canvas) {
    var self = this;
    this.net.toWebp(canvas.toDataURL(), this.count, function(webp, idx){
        self.tempFrames.push({
            idx : idx,
            image : webp
        });
        if(self.needToCreateVideo){
            self.createVideo();
        }
    });
    this.count += 1;
};

NetworkWebpProcessor.prototype.getBlob = function (frameRateResolverFunction) {
    var self = this;
    var frameRate = frameRateResolverFunction(self.count);
    this.fps = frameRate;
    return new Promise(function (resolve) {
        self.resolve = resolve;
        self.needToCreateVideo = true;
        self.createVideo();
    });
};

NetworkWebpProcessor.prototype.createVideo = function (){

    if(this.tempFrames.length != this.count){
        return;
    }
    this.logger.debug("creating video");
    this.arrangeFrames();
    var blob = new Whammy.fromImageArray(this.frames, this.fps);
    this.resolve(blob);
};

NetworkWebpProcessor.prototype.arrangeFrames = function(){

    //sort by index
    this.tempFrames.sort(function(a, b){
        return a.idx - b.idx;
    });

    //remove idx from each ele
    this.frames = this.tempFrames.map(function(i){
        return "data:image/webp;base64,"+ i.image;
    });
};