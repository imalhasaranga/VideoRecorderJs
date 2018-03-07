/**
 * Created by imal365 on 3/7/18.
 */

var UtilityHelper = function () {

};

UtilityHelper.getValue = function(value, defaultValue){
    return (value != null) ? value : defaultValue;
};



UtilityHelper.typeFixGetRecType = function (type) {
    if(type !== null){  //TODO remove old types
        if(type == "webscript"){
            return IVideoRecorder.AMSR;
        }else if(type == "mediarecorder"){
            return IVideoRecorder.MSR;
        }
    }
    if([IVideoRecorder.AMSR, IVideoRecorder.MSR].indexOf(type) != -1 || type == null){
        if(type == null){
            return (typeof MediaRecorder == 'function') ? IVideoRecorder.MSR : IVideoRecorder.AMSR;
        }
        return type;
    }

    throw "Unknown media type exception";

};

UtilityHelper.notEmpty = function (value, errorMessage) {
    if (value == null) {
        throw errorMessage;
    }
};

UtilityHelper.nonZero = function (value, errorMessage) {
    if (parseInt(value) == 0) {
        throw errorMessage;
    }
};

UtilityHelper.getElement = function (elementId,ifNoneElementNodeName) {
    if(elementId == null){
        return document.createElement(ifNoneElementNodeName);
    }
    return document.getElementById(elementId);
};
