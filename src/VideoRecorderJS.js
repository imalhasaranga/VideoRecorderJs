var VideoRecorderJS = (function () {


    var videoAudioSync = null;


    var mediaRecorder = null;


    var streamEnded = false;
    var mediaStream;


    var mediaRecorderType;


    var audioElement;
    var videoElement;


    //----- blob upload parameters --------------------
    var UploadingURL = "";
    var BlobSlizeArray = [];
    var CurrentBlobUpload = 0;
    var chunksize = 1048576;
    var functononupload = null;
    var parametername = "";


    var logger = new Logger();
    var config = null;

    var startTime = null;

    function HTML5Recorder(configs, streamready, streamerror) {

        UtilityHelper.notEmpty(configs.videotagid, "Video Tag is Undefined in the Options Object.... Quiting");
        config = configs;

        mediaRecorderType = UtilityHelper.typeFixGetRecType(configs.mediaRecorderType);
        audioElement = UtilityHelper.getElement(configs.audiotagid, "audio");
        videoElement = UtilityHelper.getElement(configs.videotagid, "video");
        videoElement.autoplay = true;
        videoElement.muted = true;


        initRecroder(streamready, streamerror);
    };


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
                        mediaRecorder = new MediaStreamRecorder(mediaStream);
                    } else {
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
        if (videoAudioSync != null) {
            clearTimeout(videoAudioSync);
        }

        mediaRecorder.stop();
        mediaRecorder.requestBlob().then(function (mediaObjectArray) {

            videoBlobURL = window.URL.createObjectURL(videoblob);
            audioBlobURL = window.URL.createObjectURL(audioblob);
            videoElement.autoplay = false;
            videoElement.src = videoBlobURL;
            reinit();
            oncapturefinish(mediaObjectArray);

        });
        if (removeMediastrema) {
            mediaStream && mediaStream.stop();
        }
    }

    function setUpPlay(mediaObject){

        /*
        * videoElement.muted = false;
         videoElement.autoplay = false;
         videoElement.src = bloburl;
         videoElement.currentTime = time ? time : parseInt(videoElement.duration / 2);
        *
        * */
    }


    HTML5Recorder.prototype.play = function () {
        reinit();
        videoElement.muted = false;
        videoElement.autoplay = true;
        videoElement.src = videoBlobURL;
        audioElement.src = audioBlobURL;
        videoAudioSync = setTimeout(function () {
            audioElement.currentTime = videoElement.currentTime;
            audioElement.play();
        }, 100);

    };

    function clearRecording() {
        reinit();
        videoBlobURL = null;
        audioBlobURL = null;
    }

    HTML5Recorder.prototype.clearRecording = function () {
        var self = this;
        if (streamEnded) {
            stopCapture(false, function () {
            });
            clearRecording();
            initRecroder(function () {
            });
        } else {
            clearRecording();
            stopCapture(false, function () {
            });
        }
    };

    HTML5Recorder.prototype.uploadData = function (options, onupload) {
        CurrentBlobUpload = 0;
        BlobSlizeArray = [];
        functononupload = onupload;
        chunksize = options.blobchunksize;
        UploadingURL = options.requestUrl;
        parametername = options.requestParametername;
        var allblobs = [];
        var allnames = [];

        allblobs[allblobs.length] = videoBlobData;
        allblobs[allblobs.length] = audioBlobData;
        allnames[allnames.length] = options.videoname;
        allnames[allnames.length] = options.audioname;

        sendRequest(allblobs, allnames);
    };


    //-------------------------------------------------------------------------------------------


    function reinit() {
        if (videoAudioSync != null) {
            clearTimeout(videoAudioSync);
        }
    }

    /*------------------------------*/


    function sendRequest(blobar, namear) {

        for (var y = 0; y < blobar.length; ++y) {
            var blob = blobar[y];
            var blobnamear = namear[y];

            var BYTES_PER_CHUNK = chunksize; //1048576; // 1MB chunk sizes.
            var SIZE = blob.size;
            var start = 0;
            var end = BYTES_PER_CHUNK;

            while (start < SIZE) {
                var chunk = blob.slice(start, end);
                var chunkdata = {blobchunk: chunk, upname: blobnamear};
                BlobSlizeArray[BlobSlizeArray.length] = chunkdata;
                start = end;
                end = start + BYTES_PER_CHUNK;
            }
        }
        var blobdataa = BlobSlizeArray[CurrentBlobUpload];
        uploadBlobs(blobdataa.blobchunk, blobdataa.upname);
    }


    function uploadBlobs(blobchunk, namesend) {
        var fd = new FormData();
        fd.append("fileToUpload", blobchunk);
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);

        xhr.open("POST", UploadingURL + "?" + parametername + "=" + namesend);

        xhr.onload = function (e) {
            if (BlobSlizeArray.length > (CurrentBlobUpload + 1)) {
                functononupload(BlobSlizeArray.length, (CurrentBlobUpload + 1));
                ++CurrentBlobUpload;
                var blobdataa = BlobSlizeArray[CurrentBlobUpload];
                uploadBlobs(blobdataa.blobchunk, blobdataa.upname);

            } else {
                functononupload(BlobSlizeArray.length, BlobSlizeArray.length);
            }
        };
        xhr.send(fd);
    }


    function uploadComplete(evt) {
        if (evt.target.responseText != "") {
            alert(evt.target.responseText);
        }
    }

    function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.");
    }

    function uploadCanceled(evt) {
        xhr.abort();
        xhr = null;
    }


    return {init: HTML5Recorder};
})();
