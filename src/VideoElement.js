/**
 * Created by imal365 on 3/9/18.
 */
var VideoElement = function () {
    var Ve = UtilityHelper.getElement(null, "video");
    var alVe = null;
    var parentAlVe = null;
    var isVeVisisble = true;
    var isAveVisible = true;

    var isWebmSupported =  false; //("" !== Ve.canPlayType('video/webm; codecs="vp8, vorbis"'));
    if (!isWebmSupported) {
        alVe = new OGVPlayer();
    }

    function swapAndShowVe(isVe) {
        // if (!isWebmSupported) {
        //     var ele = Ve.getPlayableElement();
        //     ele.pause();
        //     ele.currentTime = 0;
        //     isVeVisisble = isVe;
        //     isAveVisible = !isVe;
        //     Ve.style.display = isVe ? null : "none";
        //     parentAlVe.style.display = isVe ? "none" : null;
        // }
    }

    Ve.appendTo = function (DomElement) {
        if (!isWebmSupported) {
            DomElement.appendChild(alVe);
            parentAlVe = DomElement.querySelector('ogvjs');
            parentAlVe.style.display = isAveVisible ? null : "none";
        }
        DomElement.appendChild(Ve);
    };

    Ve.atttach = function (streamOrSrc) {
        /*
         URL.createObjectURL(stream) is depricated
         https://www.chromestatus.com/features/5618491470118912
         */
        swapAndShowVe(true);
        if (typeof Ve.srcObject == "object") {
            Ve.srcObject = streamOrSrc;
        } else {
            Ve.src = window.URL.createObjectURL(streamOrSrc);
        }
    };

    Ve.deattach = function () {
        swapAndShowVe(false);
        if (typeof Ve.srcObject == "object") {
            Ve.srcObject = null;
        } else {
            Ve.src = null;
        }
    };

    /*
    * This function will not support dataurls, only object urls and paths
    * */


    Ve.getPlayableElement = function () {
        return isWebmSupported ? Ve : alVe;
    };


    return Ve;
};


