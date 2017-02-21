var VideoRecorderJS = (function () {


    window.URL = window.URL ||
        window.webkitURL;

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    window.AudioContext = window.AudioContext ||
        window.webkitAudioContext;

    window.BlobBuilder = window.MozBlobBuilder ||
        window.WebKitBlobBuilder ||
        window.BlobBuilder;

    /*** Web Recoder Script  ***/
    var canvas;
    var ctx;
    var recorder;

    var videoAudioSync = null;
    var recrodinterval = null;

    var quality = 1;
    var framerate = 15;
    var webp_quality = 0.8;
    var frames = [];

    var audioBlobURL;
    var videoBlobURL;
    var audioBlobData;
    var videoBlobData;

    /*** Web Recoder Script  End***/

    /*** MediaRecorder Api  ***/

    var mediaRecorder = null;
    var chunks = [];
    var recordedBlob = null;
    var callbackFunc = null;

    /*** MediaRecorder Api  End ***/
    var streamEnded = false;
    var mediaStream;
    var audio_context;


    var default_width = "320";
    var default_height = "240";
    var isMediaRecorder = false;
    var logs = true;
    var mediaRecorderType = "auto";
    var UploadingURL = "";
    var workerPath = null;


    var audioElement;
    var videoElement;


    //----- blob upload parameters --------------------

    var BlobSlizeArray = [];
    var CurrentBlobUpload = 0;
    var chunksize = 1048576;
    var functononupload = null;
    var parametername = "";


    var startTime = null;

    function HTML5Recorder(options, streamready, streamerror) {

        var vw = (options.videoWidth !== null) ? options.videoWidth + "" : default_width;
        var vh = (options.videoHeight !== null) ? options.videoHeight + "" : default_height;

        quality = (options.resize !== null) ? parseFloat(options.resize) : quality;
        webp_quality = (options.webpquality != null) ? options.webpquality : webp_quality;
        framerate = (options.framerate !== null) ? options.framerate : framerate;
        logs = (options.log) ? options.log : logs;
        mediaRecorderType = (options.mediaRecorderType !== null) ? options.mediaRecorderType : mediaRecorderType;
        workerPath = (options.workerPath != null) ? options.workerPath : workerPath;

        if (options.videotagid !== null) {
            videotagid = options.videotagid;
        } else {
            throw "Video Tag is Undefined in the Options Object.... Quiting";
        }


        audioElement = document.querySelector('audio');
        videoElement = document.getElementById(options.videotagid);
        videoElement.width = vw;
        videoElement.height = vh;
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');

        initRecroder(streamready,streamerror);
    }

    function initRecroder(streamready,streamerror){
        videoElement.autoplay = true;
        videoElement.muted = true;
        try {
            streamEnded = false;
            audio_context = new AudioContext();
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
                        this.getVideoTracks().forEach(function (track) { //in case... :)
                            track.stop();
                        });
                        streamEnded = true;
                    };

                    videoElement.src = window.URL.createObjectURL(stream);

                    var isMediaRec = true;
                    if(mediaRecorderType !== null){
                        if(mediaRecorderType == "webscript"){
                            isMediaRec = false;
                        }else if(mediaRecorderType == "mediarecorder"){
                            isMediaRec = true;
                        }
                    }

                    if (isMediaRec && typeof MediaRecorder == 'function') {
                        isMediaRecorder = true;
                        mediaRecorder = new MediaRecorder(stream);
                        chunks = [];
                        recordedBlob = null;
                        callbackFunc = null;

                        mediaRecorder.ondataavailable = function (e) {
                            chunks.push(e.data);
                        };

                        mediaRecorder.onstop = function (e) {
                            recordedBlob = new Blob(chunks, {'type': 'video/webm'});
                            callbackFunc([
                                {type: "video", blob: recordedBlob, mimeType: "video/webm", extension: "webm"}
                            ]);
                            videoBlobURL = window.URL.createObjectURL(recordedBlob);
                            videoElement.src = null;
                            var spentTime = (new Date().getTime() - startTime) / 1000;
                            onVideo(videoBlobURL,parseInt(spentTime/2));
                            lg("Finished Time : " + spentTime);
                        };

                    } else {
                        reinit();
                        videoBlobURL = null;
                        audioBlobURL = null;
                        if(recorder){
                            recorder.clear();
                        }

                        var input = audio_context.createMediaStreamSource(stream);
                        isMediaRecorder = false;
                        var zeroGain = audio_context.createGain();
                        zeroGain.gain.value = 0;
                        input.connect(zeroGain);
                        zeroGain.connect(audio_context.destination);
                        recorder = new Recorder(input,{workerPath : workerPath});
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

    function startCapture(){
        if (isMediaRecorder) {
            chunks = [];
            recordedBlob = null;
            mediaRecorder.start();
        } else {
            var newWidth = canvas.width = parseInt(quality * videoElement.clientWidth);
            var newHeight = canvas.height = parseInt(quality * videoElement.clientHeight);
            var timmer = parseInt(1000 / framerate);
            recorder && recorder.record();

            recrodinterval = setInterval(function () {
                if(videoElement.readyState === 4) {
                    ctx.drawImage(videoElement, 0, 0, newWidth, newHeight);
                    if (webp_quality == 1.0) {
                        frames.push(canvas.toDataURL('image/webp'));
                    } else {
                        frames.push(canvas.toDataURL('image/webp', webp_quality));
                    }
                }
            }, timmer);
        }

        lg('Recording audio and video... Using ' + (isMediaRecorder ? "Native MeidaRecorder" : " WebRecorder Script"));
    }


    HTML5Recorder.prototype.startCapture = function () {
        startTime = new Date().getTime();
        if(streamEnded){
            initRecroder(function(){
                startCapture();
            });
        }else{
            startCapture();
        }
    };

    function stopCapture(removeMediastrema,oncapturefinish){
        if (isMediaRecorder) {
            callbackFunc = oncapturefinish;
            if (mediaRecorder.state != "inactive") {
                mediaRecorder.stop();
            }
        } else {
            if(frames.length > 0) {
                if (recrodinterval != null) {
                    clearInterval(recrodinterval);
                }
                if (videoAudioSync != null) {
                    clearTimeout(videoAudioSync);
                }
                var audioBlob = null;
                var videoBlob = null;
                var spentTime = (new Date().getTime() - startTime) / 1000;
                var localframerate = parseInt(frames.length) / spentTime;

                lg(localframerate + " Time : " + spentTime + " Frames : " + frames.length);

                recorder && recorder.stop();
                recorder && recorder.exportWAV(function (blob) {
                    audioBlob = blob;
                    if ((audioBlob != null) && (videoBlob != null)) {
                        capturefinish(blob, videoBlob, oncapturefinish);
                        onVideo(videoBlobURL,parseInt(spentTime/2));
                    }
                    recorder.clear();
                });
                videoBlob = new Whammy.fromImageArray(frames, localframerate);
                if ((audioBlob != null) && (videoBlob != null)) {
                    capturefinish(audioBlob, videoBlob, oncapturefinish);
                    onVideo(videoBlobURL,parseInt(spentTime/2));
                }
            }
        }

        if(removeMediastrema){
            mediaStream && mediaStream.stop();
        }
    }

    function onVideo(bloburl,time){
        videoElement.muted = false;
        videoElement.autoplay = false;
        videoElement.src = bloburl;
        videoElement.currentTime = time ? time : parseInt(videoElement.duration/2);
    }


    HTML5Recorder.prototype.stopCapture = function (oncapturefinish) {
        stopCapture(true,oncapturefinish);
    };


    HTML5Recorder.prototype.play = function () {
        if (isMediaRecorder) {
            videoElement.muted = false;
            videoElement.autoplay = true;
            videoElement.src = videoBlobURL;
        } else {
            reinit();
            videoElement.muted = false;
            videoElement.autoplay = true;
            videoElement.src = videoBlobURL;
            audioElement.src = audioBlobURL;
            videoAudioSync = setTimeout(function () {
                audioElement.currentTime = videoElement.currentTime;
                audioElement.play();
            }, 100);
        }

    };

    function clearRecording(){
        if (isMediaRecorder) {
            chunks = [];
            recordedBlob = null;
        } else {
            reinit();
            videoBlobURL = null;
            audioBlobURL = null;
        }
    }

    HTML5Recorder.prototype.clearRecording = function () {
        var self = this;
        if(streamEnded){
            stopCapture(false,function(){});
            clearRecording();
            initRecroder(function(){
            });
        }else{
            clearRecording();
            stopCapture(false,function(){});
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


    /* WebRecorder Script Fuctions */

    function capturefinish(audioblob, videoblob, oncapturefinish) {
        audioBlobData = audioblob;
        videoBlobData = videoblob;
        videoBlobURL = window.URL.createObjectURL(videoblob);
        audioBlobURL = window.URL.createObjectURL(audioblob);
        videoElement.autoplay = false;
        videoElement.src = videoBlobURL;
        reinit();
        oncapturefinish([
            {type: "video", blob: videoblob, mimeType: "video/webm", extension: "webm"},
            {type: "audio", blob: audioblob, mimeType: "audio/wav", extension: "wav"}
        ]);
    }

    function reinit() {

        if (recrodinterval != null) {
            clearInterval(recrodinterval);
        }
        if (videoAudioSync != null) {
            clearTimeout(videoAudioSync);
        }
        frames = [];
    }

    /*------------------------------*/


    function lg(data) {
        if (logs) {
            console.log(data);
        }
    }


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
        lg("Upload Success");
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
