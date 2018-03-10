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
        Logger.LEVEL = Logger.getLevel(configs.logLevel);
        logger.debug("active");
        logger.info("active");
        logger.warn("active");
        logger.error("active");

        UtilityHelper.notEmpty(configs.placeholder, "Placeholder id is Undefined in the Options Object.... Quiting");
        config = configs;

        mediaRecorderType = UtilityHelper.typeFixGetRecType(configs.mediaRecorderType);
        var holder = UtilityHelper.getElement(configs.placeholder, "div");
        audioElement = UtilityHelper.getElement(null, "audio");
        videoElement = new VideoElement();
        videoElement.appendTo(holder);
        var ele = videoElement.getPlayableElement();

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
                    videoElement.atttach(stream);
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
        videoElement.atttach(mediaStream);
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
            videoElement.deattach();
            videoPlaybackHelper.setMedia(mediaObjectArray);
            oncapturefinish(mediaObjectArray);
        });
        if (removeMediastrema) {
            mediaStream && mediaStream.stop();
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
