


var VIRecorder = (function(){
    

    window.URL =    window.URL || 
                    window.webkitURL;
        
    navigator.getUserMedia  =   navigator.getUserMedia || 
                                navigator.webkitGetUserMedia || 
                                navigator.mozGetUserMedia || 
                                navigator.msGetUserMedia;

    window.AudioContext     =   window.AudioContext || 
                                window.webkitAudioContext;

    window.BlobBuilder      =   window.MozBlobBuilder || 
                                window.WebKitBlobBuilder || 
                                window.BlobBuilder;

    var canvas;
    var ctx;


    var recorder;
    var localStream;
    var audio_context;

    var UploadingURL = "";

    var videoAudioSync = null;
    var recrodinterval = null;
    var framepushtime  = 0;

    var quality = 1;
    var framerate = 15;
    var frames = [];
    var webp_quality = 0.8;

    var audioElement;
    var videoElement;
    var audioBlobURL;
    var videoBlobURL;
    var audioBlobData;
    var videoBlobData;


    //----- blob upload parameters --------------------

    var BlobSlizeArray = [];
    var CurrentBlobUpload = 0;
    var chunksize = 1048576;
    var functononupload  = null;
    var parametername = "";
    var UploadingURL = ""



    var startTime = null;

     function init(options, streamready, streamerror) {
        var vw = "320";
        var vh = "240";

        quality = evaluateQuality(options.initVIRecorder);
        if(options.videoWidth != undefined)   {   vw = options.videoWidth+""                 }    
        if(options.videoHeight != undefined)  {   vh = options.videoHeight+""                } 
        if(options.webpquality != undefined)  {   webp_quality = options.webpquality         }     
        if(options.framerate != undefined)    {   framerate = options.framerate              }     
        if(options.videotagid != undefined)   {   videotagid = options.videotagid            }else { throw "Video Tag is Undefined"; }     



        audioElement = document.querySelector('audio'); 
        videoElement = document.getElementById(options.videotagid);   
        prepareVideoElement(videoElement);
        canvas =  document.createElement('canvas');
        ctx = canvas.getContext('2d');
        

        try {
            audio_context = new AudioContext;
            navigator.getUserMedia(
            {
                audio: true, 
                video: true
            }, 
            function(stream){
                streamready();
                var input = audio_context.createMediaStreamSource(stream);
                localStream = window.URL.createObjectURL(stream);
                videoElement.src = localStream;
                
                var zeroGain = audio_context.createGain();
                zeroGain.gain.value = 0;
                input.connect(zeroGain);
                zeroGain.connect(audio_context.destination);
                recorder = new Recorder(input);
            }, 
            function(e) {
                streamerror({ code : 100, error : e});
            });

        } catch (e) {
                streamerror({ code : 101, error : e});
        }


        function prepareVideoElement(videoelement){
            videoelement.width = vw;
            videoelement.height = vh;
            videoelement.autoplay = true;
            videoelement.muted = true;
        }

    };

    

   init.prototype.startCapture = function() {
            
            startTime = new Date().getTime();
            // ------- Video Recording started ---------------------------------
            var newWidth = canvas.width  = parseInt(quality*videoElement.clientWidth);
            var newHeight = canvas.height = parseInt(quality*videoElement.clientHeight);
            var timmer  = parseInt(1000 /framerate);

            //--------- Audio Recording Started --------------------------------
            recorder && recorder.record();

            recrodinterval = setInterval(function(){
                ctx.drawImage(videoElement, 0, 0, newWidth, newHeight);
                frames.push(canvas.toDataURL('image/webp', webp_quality));
            }, timmer);

            
            lg('Recording audio and video...');
    }
     

   init.prototype.stopCapture =  function (oncapturefinish) {
        endCaptureInit();
        var audioBlob = null;
        var videoBlob = null;
        var spentTime = (new Date().getTime() -startTime)/1000;
        var localframerate = parseInt(frames.length) /spentTime;
        lg(localframerate+" Time : "+spentTime+" Frames : "+frames.length);


        recorder && recorder.stop();
        recorder && recorder.exportWAV(function(blob) {
            audioBlob = blob;
            if((audioBlob != null) && (videoBlob != null)){
                capturefinish(blob, videoBlob , oncapturefinish);   
            }
          recorder.clear();
        });
        
        videoBlob = new Whammy.fromImageArray(frames, localframerate);
        if((audioBlob != null) && (videoBlob != null)){
                capturefinish(videoBlob, audioBlob, oncapturefinish);   
        }
     
    }





    function capturefinish(audioblob, videoblob, oncapturefinish){
        audioBlobData = audioblob;
        videoBlobData = videoblob;
        videoBlobURL = window.URL.createObjectURL(videoblob);
        audioBlobURL = window.URL.createObjectURL(audioblob);
        videoElement.autoplay = false;
        videoElement.src = videoBlobURL;
        reinit();
        oncapturefinish(audioblob,videoblob);
    }


    init.prototype.play = function(){
        reinit();
       
        videoElement.autoplay = true;
        videoElement.src = videoBlobURL;
        audioElement.src = audioBlobURL;
        videoAudioSync =setTimeout(function(){
            audioElement.currentTime = videoElement.currentTime;
            audioElement.play();
        },100);
    }

    init.prototype.clearRecording = function(){
        reinit();
        videoElement.autoplay = true;
        videoElement.src = localStream;
        videoBlobURL = null;
        audioBlobURL = null;
        
    }

    init.prototype.uploadData = function(options , onupload){
          CurrentBlobUpload  = 0;  
          BlobSlizeArray = [];
          functononupload = onupload;
          chunksize = options.blobchunksize;
          UploadingURL = options.requestUrl;
          parametername = options.requestParametername;
          var allblobs = [];
          var allnames = [];

          allblobs[allblobs.length] = videoBlobData
          allblobs[allblobs.length] = audioBlobData
          allnames[allnames.length] = options.videoname
          allnames[allnames.length] = options.audioname

          sendRequest(allblobs , allnames );
    }

  
    //-------------------------------------------------------------------------------------------


    function lg(data){
        console.log(data);
    }


    navigator.whichbrowser= (function(){
        var ua= navigator.userAgent, tem, M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        return M[1];
    })();



    function isFloat(value){
        if(isNaN( parseFloat(value) )){
            return false;
        }
        return true;
    }


    function evaluateQuality(varaiblequaity){
        if(varaiblequaity == undefined){
            return  1;
        }else{
            if(isFloat(varaiblequaity)){
                return  parseFloat(varaiblequaity);
            }
           return  1;     
        }
    }

    function reinit(){
        
        if(recrodinterval != null){
            clearInterval(recrodinterval);
        }
        if(videoAudioSync != null){
            clearTimeout(videoAudioSync);
        }
        frames = [];
    }

    function endCaptureInit(){
        if(recrodinterval != null){
            clearInterval(recrodinterval);
        }
        if(videoAudioSync != null){
            clearTimeout(videoAudioSync);
        }
    }

    

    function sendRequest(blobar , namear ) {
    
          for(var y =0; y < blobar.length; ++y){
                var blob = blobar[y]; 
                var blobnamear = namear[y];

                var BYTES_PER_CHUNK = chunksize; //1048576; // 1MB chunk sizes.
                var SIZE = blob.size;
                var start = 0;
                var end = BYTES_PER_CHUNK;
  
                while( start < SIZE ) {
                    var chunk = blob.slice(start, end);
                    var chunkdata = { blobchunk : chunk , upname : blobnamear};
                    BlobSlizeArray[BlobSlizeArray.length] = chunkdata;
                    start = end;
                    end = start + BYTES_PER_CHUNK;
                }
          }  
            var blobdataa = BlobSlizeArray[CurrentBlobUpload];
            uploadBlobs(blobdataa.blobchunk, blobdataa.upname); 
    }

    
    function uploadBlobs(blobchunk , namesend){
        var fd = new FormData();
        fd.append("fileToUpload", blobchunk);
        var xhr = new XMLHttpRequest();


        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);

        xhr.open("POST", UploadingURL+"?"+parametername+"="+namesend);

        xhr.onload = function(e) {
            if (BlobSlizeArray.length > (CurrentBlobUpload+1)){
                functononupload(BlobSlizeArray.length , (CurrentBlobUpload+1));
                ++CurrentBlobUpload;
                var blobdataa = BlobSlizeArray[CurrentBlobUpload];
                uploadBlobs(blobdataa.blobchunk, blobdataa.upname); 
                
            }else{
                functononupload(BlobSlizeArray.length , BlobSlizeArray.length);
            }
        };
        xhr.send(fd);
    }


    

    function uploadComplete(evt) {
            lg("Upload Success");
            if (evt.target.responseText != ""){
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

    

     return { initVIRecorder : init};
})()









