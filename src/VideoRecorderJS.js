/*
 *
 * Articls
 * https://zhirzh.github.io/2017/09/02/mediarecorder/
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder
 * https://developers.google.com/web/updates/2016/01/mediarecorder
 * https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/record
 * */

var VideoRecorderJS = (function () {
    var logger = new Logger();

    var config = null;
    var mediaRecorderType;
    var videoElement;
    var audioElement;
    var mediaRecorder;
    var streamEnded;
    var mediaStream;
    var videoPlaybackHelper;
    var startTime = null;

    var RecorderStatus;  //READY, RECORDING, STOPED_RECORDING, PLAYING,

    function HTML5Recorder(configs, streamready, streamerror) {

        UtilityHelper.notEmpty(configs.videotagid, "Video Tag is Undefined in the Options Object.... Quiting");
        config = configs;

        mediaRecorderType = UtilityHelper.typeFixGetRecType(configs.mediaRecorderType);
        audioElement = UtilityHelper.getElement(configs.audiotagid, "audio");
        videoElement = UtilityHelper.getElement(configs.videotagid, "video");
        videoPlaybackHelper = new VideoPlaybackHelper(videoElement, audioElement);
        prepareForRecorde();
        initRecroder(streamready, streamerror);
    }

    function prepareForRecorde() {
        videoElement.autoplay = true;
        videoElement.muted = true;
    }


    function initRecroder(streamready, streamerror) {

        try {
            streamEnded = false;
            var audio_context = new AudioContext();
            getUserMedia(
                {
                    audio: true,
                    video: true
                },
                function (stream) {
                    mediaStream = stream;
                    mediaStream.stop = function () {
                        this.getAudioTracks().forEach(function (track) {
                            track.stop();
                        });
                        this.getVideoTracks().forEach(function (track) {
                            track.stop();
                        });
                        streamEnded = true;
                    };
                    atttach();
                    config.sampleRate = audio_context.sampleRate;
                    RecorderStatus = "READY";

                    if (mediaRecorderType == IVideoRecorder.MSR) {
                        logger.debug("Video Recording Strategy : MSR");
                        mediaRecorder = new MediaStreamRecorder(mediaStream);
                    } else {
                        logger.debug("Video Recording Strategy : AMSR");
                        config.videoElement = videoElement;
                        mediaRecorder = new AMediaStreamRecorder(mediaStream, config);
                    }
                    streamready && streamready();

                },
                function (e) {
                    streamerror && streamerror(e);
                });

        } catch (e) {
            e.name = "BROWSER_NOT_SUPPORTED";
            streamerror && streamerror(e);
        }
    }


    HTML5Recorder.prototype.startCapture = function () {
        prepareForRecorde();
        atttach();
        if (streamEnded) {
            initRecroder(function () {
                mediaRecorder.start();
            });
        } else {
            mediaRecorder.start();
        }
        RecorderStatus = "RECORDING";
    };

    HTML5Recorder.prototype.stopCapture = function (oncapturefinish,detachStream) {
        if(RecorderStatus == "RECORDING"){
            stopCapture(detachStream, oncapturefinish);
            RecorderStatus = "STOPED_RECORDING";
        }
    };

    HTML5Recorder.prototype.play = function () {
        if(RecorderStatus == "STOPED_RECORDING" || RecorderStatus == "PLAYBACK"){
            videoPlaybackHelper.play();
            RecorderStatus = "PLAYBACK";
        }
    };

    HTML5Recorder.prototype.clearRecording = function () {
        if(streamEnded){
            stopCapture(false,function(){});
            initRecroder(function(){
            });
        }else{
            stopCapture(false,function(){});
        }
    };

    HTML5Recorder.prototype.detachHardwareRes = function () {
        mediaStream && mediaStream.stop();
    };

    HTML5Recorder.prototype.getTotalSizeMB = function () {
        return mediaRecorder.getTotalSizeMB();
    };

    HTML5Recorder.prototype.getRecorderStatus = function () {
            return RecorderStatus;
    };

    HTML5Recorder.prototype.downloadBlob = function (blob, name) {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    HTML5Recorder.prototype.uploadData = function (options, onupload) {

    };

    function stopCapture(removeMediastrema, oncapturefinish) {
        videoPlaybackHelper.stopAndClearPlayback();
        mediaRecorder.stop();
        mediaRecorder.requestBlob().then(function (mediaObjectArray) {
            deattach();
            videoPlaybackHelper.setMedia(mediaObjectArray);
            oncapturefinish(mediaObjectArray);
        });
        if (removeMediastrema) {
            mediaStream && mediaStream.stop();
        }
    }
    
    function atttach() {
        /*
         URL.createObjectURL(stream) is depricated
         https://www.chromestatus.com/features/5618491470118912
         */
        if (typeof videoElement.srcObject == "object") {
            videoElement.srcObject = mediaStream;
        } else {
            videoElement.src = window.URL.createObjectURL(mediaStream);
        }
    }
    
    function deattach() {
        if (typeof videoElement.srcObject == "object") {
            videoElement.srcObject = null;
        } else {
            videoElement.src = null;
        }
    }

    function getUserMedia(options, sucess, errror) {
        if (navigator.mediaDevices.getUserMedia) {
            logger.debug("whichUserMedia :  navigator.mediaDevices.getUserMedia");
            navigator.mediaDevices.getUserMedia(options).then(sucess).catch(errror);
        } else if (navigator.getUserMedia) {
            logger.debug("whichUserMedia :  navigator.getUserMedia");
            navigator.getUserMedia(options, sucess, errror);
        }
    }

    return {init: HTML5Recorder};
})();
