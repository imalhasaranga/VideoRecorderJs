
 window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;


    window.requestAnimationFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame
    })();


var audio;
var video;
var width;
var height;
var canvas;
var images = [];
var ctx;
var capture;
var startTime;

var progress;
var startButton;
var stopButton;

var quality = 1;


var audio_context;

var recorder;
var localStream;

var capturing = false;
var audioFinished = false;
var videoFinished = false;
var audioBlob = null;
var videoBlob = null;
var UploadingURL = "";
var displaystatus = -1;

$.fn.initVideoAudioRec = function(options) {
    initVideoAudioRecording($(this),options);
};




function initVideoAudioRecording(container,options) {
    
    if(options.quality == undefined){
        quality = 1;
    }else{
        if(isFloat(options.quality)){
            quality = parseFloat(options.quality);
        }else{
            quality = 1;
        }
    }
    var startRecrodBut = "startRecrodBut";
    var stopRecBut = "stopRecBut";
    var vw = "320";
    var vh = "240";
   
    if(options.startButtonId != undefined){  startRecrodBut = options.startButtonId+""  }
    if(options.stopButtonId != undefined){   stopRecBut = options.stopButtonId+"" }   
    if(options.videoWidth != undefined){   vw = options.videoWidth+"" }    
    if(options.videoHeight != undefined){   vh = options.videoHeight+"" } 
    if(options.uploadURL != undefined){   UploadingURL = options.uploadURL+"" }     

    

    
    audio = document.querySelector('audio'); 
    canvas =  document.createElement('canvas');
    ctx = canvas.getContext('2d');
    
    var videlement = "<video width=\""+vw+"\" height=\""+vh+"\" id=\"imal_ha_videorecele\" autoplay=\"true\" muted></video>";
    var progressbar = "<progress id=\"progress_im_videorecele\" style=\"visibility: hidden; float:left; width:100% \"></progress>";
    
    container.prepend(progressbar);
    container.prepend(videlement);
    
    $("#"+startRecrodBut).on("click",function(e){
        startCapture();
    });

    $("#"+stopRecBut).attr("disabled","disabled");
    $("#"+stopRecBut).on("click",function(e){
        stopCapture();
    });

    $("#"+startRecrodBut).hide();
    $("#"+stopRecBut).hide();
    video = document.getElementById('imal_ha_videorecele');
    progress = document.getElementById('progress_im_videorecele');
    startButton = document.getElementById(startRecrodBut);
    stopButton = document.getElementById(stopRecBut);

   


    try {
        audio_context = new AudioContext;
    } catch (e) {
        alert('No Web Audio Support In This Browser!');
    }

    

    navigator.getUserMedia(
        {
            audio: true, 
            video: true
        }, 

        function(stream){

        var input = audio_context.createMediaStreamSource(stream);
        var inputstream = window.URL.createObjectURL(stream);
        video.src = inputstream;
        if(inputstream && (displaystatus == -1)){
            displaystatus = 1;
            $("#"+startRecrodBut).show();
            $("#"+stopRecBut).show();
        }
        
        var zeroGain = audio_context.createGain();
        zeroGain.gain.value = 0;
        input.connect(zeroGain);
        zeroGain.connect(audio_context.destination);
        
        recorder = new Recorder(input);

        }, 

        function(e) {
            alert('Audio Input is Not Found : ' + e);
        });

    }



function nextFrame(){
    if(capturing){
        var w = width*quality;
        var h = height*quality;
        ctx.drawImage(video, 0, 0, w, h);
        var imageData = ctx.getImageData(0, 0, w, h);
        pix = imageData.data;
		ctx.putImageData(imageData, 0, 0);
        images.push({duration : new Date().getTime() - startTime, datas : imageData});
        startTime = new Date().getTime();
        requestAnimationFrame(nextFrame);
    }else{
        var capture = new Whammy.Video();
        progress.max = images.length;
        showProgress(true);
        encodeVideo(capture, 0);
    }
 
}

function isFloat(value){
    
    if(isNaN( parseFloat(value) )){
        return false;
    }
    return true;
}


function encodeVideo(capture, currentImage) {
    if (currentImage < images.length) {
        ctx.putImageData(images[currentImage].datas, 0, 0);
        capture.add(ctx, images[currentImage].duration);
        delete images[currentImage];
        progress.value = currentImage;
        currentImage++;
        setTimeout(function() {encodeVideo(capture, currentImage);}, 1);
    } else {
        videoBlob = capture.compile();
        console.log('Video Files has Created: ' + videoBlob);
        images = [];
        enableStartButton(true);
        uploadFiles();
    }
}
 


/**
 * Initialize the css style of the buttons and the progress bar
 * when capturing.
 */
function initStyle() {
    showProgress(false);
    enableStartButton(false);
    enableStopButton(true);
}
 
/**
 * Start the video capture.
 */
function startCapture() {
    initStyle();
    //set Canvas size to the video size
   width =   video.clientWidth;
   height =  video.clientHeight;
   canvas.width =  quality*video.clientWidth;
   canvas.height = quality*video.clientHeight;

    capturing = true;
    startTime = new Date().getTime();
    nextFrame();

    recorder && recorder.record();
    console.log('Recording audio and video...');
}
 
/**
 * Stop the video capture.
 */
function stopCapture() {
    capturing = false;
    enableStopButton(false);

    recorder && recorder.stop();
    CompleteAudio();
    recorder.clear();

    console.log('Stopped recording Video and Audio.');

}


function CompleteAudio() {
    recorder && recorder.exportWAV(function(blob) {
      //var url = URL.createObjectURL(blob);  //you can use this function create downloadable wav file
      audioBlob = blob;
      uploadFiles();
    });
  }

function uploadFiles(){

    if((audioBlob != null) && (videoBlob != null)){
            var fd = new FormData();
            fd.append("video_data", videoBlob);
            fd.append("audio_data", audioBlob);
            var videosize = videoBlob.size/(1024 * 1024);
            var audiosize = audioBlob.size/(1024 * 1024);
            console.log("video size : "+videosize+"MB Audtio size : "+audiosize+"MB Total Size"+(videosize+audiosize)+"MB");
            $.ajax({
                   url: UploadingURL,
                   type: "POST",
                   data: fd,
                   processData: false,
                   contentType: false,
            }).done(function(respond){
                    alert("Files has been uploaded...."+respond);
            });
    }

}



function enableStartButton(enabled) {
    startButton.disabled = !enabled;
}
 

function enableStopButton(enabled) {
    stopButton.disabled = !enabled;
}
 
function showProgress(show) {
    progress.style.visibility = show ? 'visible' : 'hidden';
}
 
