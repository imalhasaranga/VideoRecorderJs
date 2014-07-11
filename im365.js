


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

    var quality = 1;
    var framerate = 15;
    var frames = [];
    var webp_quality = 0.8;

    var audioElement;
    var videoElement;
    var audioBlobURL;
    var videoBlobURL;

    var countdowntime = 15;
    var countdownElement= null;
    var startTime = null;

    function initVIRecorder(options) {
        var startButton;
        var stopButton;
        var vw = "320";
        var vh = "240";
        
        
        var startRecrodBut = "startRecrodBut";
        var stopRecBut = "stopRecBut";
        var palaybackbut = "playback";
        var discardrecrd = "clearrecording";

       
       
        quality = evaluateQuality(options.initVIRecorder);
        if(options.startButtonId != undefined){   startRecrodBut = options.startButtonId+""  }
        if(options.stopButtonId != undefined) {   stopRecBut = options.stopButtonId+""       }   
        if(options.videoWidth != undefined)   {   vw = options.videoWidth+""                 }    
        if(options.videoHeight != undefined)  {   vh = options.videoHeight+""                } 
        if(options.uploadURL != undefined)    {   UploadingURL = options.uploadURL+""        }     
        if(options.webpquality != undefined)  {   webp_quality = options.webpquality         }     
        if(options.framerate != undefined)    {   framerate = options.framerate              }     
        if(options.countdowntime != undefined){   countdowntime = options.recordtime         }     


        audioElement = document.querySelector('audio'); 
        videoElement = document.getElementById('im385videorecele');   
        countdownElement = document.getElementById("countdown");
        var startRecord = document.getElementById(startRecrodBut);
        var stopRecord  = document.getElementById(stopRecBut);
        var playBackRecord = document.getElementById(palaybackbut);
        var discardRecordng  = document.getElementById(discardrecrd);

        
        startRecord.addEventListener("click" , function(){
             startCapture();
        });
        stopRecord.addEventListener("click" , function(){
             stopCapture();
        });
         playBackRecord.addEventListener("click" , function(){
             playBack();
        });
        discardRecordng.addEventListener("click" , function(){
            discardRecord();
        });


        prepareVideoElement(videoElement);
        setCountDownTime(countdowntime);
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
                alert('Audio Input is Not Found : ' + e);
            });

        } catch (e) {
            alert('your browser does not support');
        }


        function prepareVideoElement(videoelement){
            videoelement.width = vw;
            videoelement.height = vh;
            videoelement.autoplay = true;
            videoelement.muted = true;
        }

    };



    function startCapture() {
        startCountDown(null);
        startTime = new Date().getTime();
        // ------- Video Recording started ---------------------------------
        var newWidth = canvas.width  = parseInt(quality*videoElement.clientWidth);
        var newHeight = canvas.height = parseInt(quality*videoElement.clientHeight);
        var timmer  = parseInt(1000 /framerate);

        recrodinterval = setInterval(function(){
            ctx.drawImage(videoElement, 0, 0, newWidth, newHeight);
            frames.push(canvas.toDataURL('image/webp', webp_quality));
        }, timmer);

        //--------- Audio Recording Started --------------------------------
        recorder && recorder.record();
        lg('Recording audio and video...');
    }
     

    function stopCapture() {
        var audioBlob = null;
        var videoBlob = null;
        var spentTime = (new Date().getTime() -startTime)/1000;
        var localframerate = parseInt(frames.length) /spentTime;
        lg(localframerate+" Time : "+spentTime+" Frames"+frames.length);

        recorder && recorder.stop();
        recorder && recorder.exportWAV(function(blob) {
            audioBlob = blob;
            if((audioBlob != null) && (videoBlob != null)){
                capturefinish(blob, videoBlob);   
            }
        });
        recorder.clear();
        videoBlob = new Whammy.fromImageArray(frames, localframerate);
        if((audioBlob != null) && (videoBlob != null)){
                capturefinish(videoBlob, audioBlob);   
        }
     
    }


    function capturefinish(audioblob, videoblob){

        var audiobase64 = window.URL.createObjectURL(audioblob);
        var videobase64 = window.URL.createObjectURL(videoblob);
        document.getElementById('audiored').src = audiobase64;
        document.getElementById('awesome').src = videobase64; 
        document.getElementById('downloadurl').style.display = '';
        document.getElementById('downloadurl').href = videobase64;
        document.getElementById('status').innerHTML = "video="+Math.ceil(videoblob.size / (1024))+"KB, Audio="+Math.ceil(audioblob.size / (1024))+"   Total= "+ (Math.ceil(videoblob.size / (1024))+ Math.ceil(audioblob.size / (1024))) + "KB";
        videoBlobURL = videobase64;
        audioBlobURL = audiobase64
        videoElement.autoplay = false;
        videoElement.src = videoBlobURL;

        sendRequest(audioblob , "audio.wav"); 
        sendRequest(videoblob , "audio.webm"); 
        reinit();
    }


    function playBack(){
        reinit();
       
        videoElement.autoplay = true;
        videoElement.src = videoBlobURL;
        audioElement.src = audioBlobURL;
        videoAudioSync =setTimeout(function(){
            audioElement.currentTime = videoElement.currentTime;
            audioElement.play();
        },100);
    }

    function discardRecord(){
        reinit();
        videoElement.autoplay = true;
        videoElement.src = localStream;
        videoBlobURL = null;
        audioBlobURL = null;
        
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
        setCountDownTime(countdowntime);
        frames = [];
    }

    function setCountDownTime(time){
        if(time == -1){
            return -1;
        }else{
            countdownElement.innerHTML = time;
            return 1;
        }
    }

    var functioncalltime = 0;
    function startCountDown(interval){
        if(interval == null){
            functioncalltime = countdowntime; 
            var intervalcount = setInterval( function(){ startCountDown(intervalcount);  }, 1000 );
            startCountDown(intervalcount);
        }else{
           var val = setCountDownTime(--functioncalltime); 
           if(val == -1){
               clearInterval(interval);
               stopCapture();
           }
        }
    }


    function sendRequest(blob , name) {
            var BYTES_PER_CHUNK = 1048576; // 1MB chunk sizes.
            var SIZE = blob.size;
            var start = 0;
            var end = BYTES_PER_CHUNK;
            
            window.uploadcounter=0;
            window.uploadfilearray = [];
            document.getElementById('progressNumber').innerHTML = "Upload: 0 % ";
            
            while( start < SIZE ) {

                var chunk = blob.slice(start, end);
                window.uploadfilearray[window.uploadcounter]=chunk;
                window.uploadcounter=window.uploadcounter+1;
                start = end;
                end = start + BYTES_PER_CHUNK;
            }

            window.uploadcounter=0;
            uploadFile(window.uploadfilearray[window.uploadcounter],name);
    }

        

    function uploadFile(blobFile,filename) {
        var fd = new FormData();
        fd.append("fileToUpload", blobFile);
        var xhr = new XMLHttpRequest();


        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);

        xhr.open("POST", UploadingURL+"?filename="+filename);

        xhr.onload = function(e) {
            window.uploadcounter=window.uploadcounter+1;
            if (window.uploadfilearray.length > window.uploadcounter ){
                uploadFile(window.uploadfilearray[window.uploadcounter], filename); 
                var percentloaded2 = parseInt((window.uploadcounter/window.uploadfilearray.length)*100);
                document.getElementById('progressNumber').innerHTML = 'Upload: '+percentloaded2+' % ';                              
            }else{
                document.getElementById('progressNumber').innerHTML = "File uploaded";
               // loadXMLDoc('./system/loaddir.php?url='+ window.currentuploaddir);
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

    

    return initVIRecorder;
})()









