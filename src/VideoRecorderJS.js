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
            navigator.getUserMedia(
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

                    videoElement.src = window.URL.createObjectURL(stream);
                    config.sampleRate = audio_context.sampleRate;

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
        if (streamEnded) {
            initRecroder(function () {
                mediaRecorder.start();
            });
        } else {
            mediaRecorder.start();
        }
    };

    HTML5Recorder.prototype.stopCapture = function (oncapturefinish) {
        stopCapture(true, oncapturefinish);
    };

    function stopCapture(removeMediastrema, oncapturefinish) {
        videoPlaybackHelper.stopAndClearPlayback();
        mediaRecorder.stop();
        mediaRecorder.requestBlob().then(function (mediaObjectArray) {
            videoPlaybackHelper.setMedia(mediaObjectArray)
            oncapturefinish(mediaObjectArray);
        });
        if (removeMediastrema) {
            mediaStream && mediaStream.stop();
        }
    }


    HTML5Recorder.prototype.play = function () {
        videoPlaybackHelper.play();
    };


    HTML5Recorder.prototype.clearRecording = function () {
        reinit();
        stopCapture(false, function () {
        });
        if (streamEnded) {
            initRecroder(function () {
            });
        }
    };

    HTML5Recorder.prototype.getTotalSizeMB = function () {
        return mediaRecorder.getTotalSizeMB();
    };

    HTML5Recorder.prototype.uploadData = function (options, onupload) {

    };


    function downloadBlob(blob,name) {
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
    }

    //-------------------------------------------------------------------------------------------


    function reinit() {
        if (videoAudioSync != null) {
            clearTimeout(videoAudioSync);
        }
    }

    return {init: HTML5Recorder};
})();
