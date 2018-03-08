/**
 * Created by imal365 on 3/7/18.
 */

var IVideoRecorder = function (mediaStream,optionalExtra) {};

IVideoRecorder.prototype.start = function () {
    throw "Not Implemented function : start()";
};
IVideoRecorder.prototype.stop = function () {
    throw "Not Implemented function : stop()";
};
IVideoRecorder.prototype.requestBlob = function () {
    throw "Not Implemented function : requestBlob()";
};

IVideoRecorder.prototype.getDuration = function () {
    throw "Not Implemented function : getDuration()";
};

IVideoRecorder.prototype.getType = function () {
    throw "Not Implemented function : getType()";
};



IVideoRecorder.AMSR = "ALTERNATIVE_MSR";
IVideoRecorder.MSR = "MSR";


window.URL = window.URL || window.webkitURL;

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

window.BlobBuilder = window.MozBlobBuilder ||
    window.WebKitBlobBuilder ||
    window.BlobBuilder;