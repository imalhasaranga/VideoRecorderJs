/**
 * Created by imal365 on 3/7/18.
 */


var Logger = function () {

};

Logger.DEBUG = 1;
Logger.INFO = 2;
Logger.WARN = 3;
Logger.ERROR = 4;
Logger.OFF = 5;
Logger.LEVEL = Logger.OFF;

Logger.prototype.info = function (message) {
    if(Logger.LEVEL <= Logger.INFO ){
        console.log("info : ",message);
    }
};

Logger.prototype.debug = function (message) {
    if(Logger.LEVEL <= Logger.DEBUG ) {
        console.log("debug : ", message);
    }
};

Logger.prototype.error = function (message) {
    if(Logger.LEVEL <= Logger.ERROR ) {
        console.log("error : ", message);
    }
};

Logger.prototype.warn = function (message) {
    if(Logger.LEVEL <= Logger.WARN) {
        console.log("warn : ", message);
    }
};

Logger.getLevel = function(level){
    var level = level ? level.toUpperCase() : "OFF";
    switch (level){
        case "OFF" :
            return Logger.OFF;
        case "ERROR" :
            return Logger.ERROR;
        case "WARN" :
            return Logger.WARN;
        case "INFO" :
            return Logger.INFO;
        case "DEBUG" :
            return Logger.DEBUG;
    }
};


