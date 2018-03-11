/**
 * Created by imal365 on 3/11/18.
 */
var IFProcessor = function () {

};


IFProcessor.prototype.prepare = function () {
    throw  "prepare is not Implmented"
};

/*
* @param canvasContext
* */
IFProcessor.prototype.processFrame = function (canvasContext,context) {
    throw "recordFrame is Not implemented";
};

/*
* return Promise
* */
IFProcessor.prototype.getBlob = function (frameRateResolverFunction) {
    throw "getBlob is Not implemented";
};