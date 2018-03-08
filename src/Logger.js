/**
 * Created by imal365 on 3/7/18.
 */


var Logger = function () {

};

Logger.prototype.info = function (message) {
    console.log("info : ",message);
};

Logger.prototype.debug = function (message) {
    console.log("debug : ",message);
};

Logger.prototype.error = function (message) {
    console.log("error : ",message);
};

Logger.prototype.warn = function (message) {
    console.log("warn : ",message);
};


