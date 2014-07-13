## HTML5 Video + Audio Recording Component 

This project is using webRTC's getUserMedia() spec to record audio and video both in the client side
and upload as chunks to the server, current project support latest versions of Opera and Chrome and 
hoping to provide support for Firefox in near future.


###Usage 

linking script files 

```html
<script src="whammy.js" type="text/javascript"></script>
<script src="recorder.js" type="text/javascript"></script>
<script src="VIRecorder.js" type="text/javascript"></script>
```

Initializing 

```html

var virec = new VIRecorder.initVIRecorder(
			 	{   
				 	recorvideodsize : 0.4, // recorded video dimentions are 0.4 times smaller than the original
			      	webpquality 	: 0.7, // chrome and opera support webp imags, this is about the aulity of a frame
			      	framerate 		: 15,  // recording frame rate 
					videotagid 		: "viredemovideoele", 
			      	videoWidth 		: "640",
			      	videoHeight 	: "480",    		
			 	} ,
		 		function(){
		 			//success callback. this will fire if browsers supports 
		 		},
			    function(err){
			   		//onerror callback, this will fire if browser does not support
			   		console.log(err.code +" , "+err.name);
				}
);

```
>"recorvideodsize" : indicates the recorded video dimentions relative to the actual size
>"webpquality"     : this indicate the quality of a single frame in the video
>"framerate"       : frame rate


###Here is a Complete Example 

```html
<html>
	<head>
  	</head>
	<body>
		<div  id="videorecorder"  >
			<video id="viredemovideoele" ></video>  
			<span style="font-size:20px;" id ="countdown"></span>
		</div>

		<input id="playback" value="PlayBack" type="button"  />
		<input id="clearrecording" value="Clear Recording" type="button"  />
		<input id="startRecrodBut1" value="Start Recording" type="button" />
		<input id="stopRecBut1" value="Stop Recording" type="button"  />
		<input id="uploadrecord" value="Upload Recording" type="button"  />


		</br>
		<p id="status"></p>
		<video id="recordedvideo"  controls></video>
		<audio id="audiored" controls></audio>
		<a id="downloadurl">Download</a>
		<div id="progressNumber" style="font-size:20px;"></div>
		
		
		<script src="whammy.js" type="text/javascript"></script>
		<script src="recorder.js" type="text/javascript"></script>
		<script src="VIRecorder.js" type="text/javascript"></script>

	  	<script type="text/javascript">


        
        var startRecord = document.getElementById("startRecrodBut1");
        var stopRecord  = document.getElementById("stopRecBut1");
		var countdownElement = document.getElementById("countdown");
		var playBackRecord = document.getElementById("playback");
        var discardRecordng  = document.getElementById("clearrecording");
        var uploadrecording  = document.getElementById("uploadrecord");
        var progressNumber  = document.getElementById("progressNumber");
        
       
		 
		 var virec = new VIRecorder.initVIRecorder(
			 	{   
				 	recorvideodsize : 0.4, // recorded video dimentions are 0.4 times smaller than the original
			      	webpquality 	: 0.7, // chrome and opera support webp imags, this is about the aulity of a frame
			      	framerate 		: 15,  // recording frame rate 
					videotagid 		: "viredemovideoele", 
			      	videoWidth 		: "640",
			      	videoHeight 	: "480",    		
			 	} ,
		 		function(){
		 			//success callback. this will fire if browsers supports 
		 		},
			    function(err){
			   		//onerror callback, this will fire if browser does not support
			   		console.log(err.code +" , "+err.name);
				}
		 );


		 startRecord.addEventListener("click" , function(){
		        virec.startCapture(); // this will start recording video and the audio 
		        startCountDown(null);
		 });
			    
		 stopRecord.addEventListener("click" , function(){
		 	/*
		 	stops the recording and after recording is finalized oncaptureFinish call back 
		 	will occur
		 	*/
			    virec.stopCapture(oncaptureFinish); 
	     });

	     playBackRecord.addEventListener("click" , function(){
	     	/*
	     	Clientside playback,
	     	*/
             	virec.play();
         });
        
         discardRecordng.addEventListener("click" , function(){
         	/*
         	Clears the current recorded video + audio allowing 
         	another recording to happen
         	*/
            	virec.clearRecording();
         });

         uploadrecording.addEventListener("click" , function(){
         	/*
         	Uploading the content to the server, here I have sliced the blobs into chunk size 
         	of 1048576 bits so that uploading time will reduce.
         	Gmail uses this same technique when we attach some files to a mail, it slize the file 
         	in the client side and then uploads chunk by chunk
         	*/
         		var uploadoptions = {
	         			blobchunksize : 1048576,
	         			requestUrl : "php/fileupload.php",
	         			requestParametername : "filename", 
	         			videoname : "video.webm",
	         			audioname : "audio.wav"
         		};
            	virec.uploadData( uploadoptions , function(totalchunks, currentchunk){
            		/*
            		This function will callback during, each successfull upload of a blob
            		so you can use this to show a progress bar or something
            		*/
            		progressNumber.innerHTML = ((currentchunk/totalchunks)*100);
            		console.log(currentchunk +" OF " +totalchunks);
            	});
         });
		

	//------------------------------- few functions that demo, how to play with the api --------------------------

	var countdowntime = 15;
	var functioncalltime = 0;

 	function oncaptureFinish(audioblob, videoblob){
		 	
		 		var audiobase64 = window.URL.createObjectURL(audioblob);
		        var videobase64 = window.URL.createObjectURL(videoblob);
		        document.getElementById('audiored').src = audiobase64;
		        document.getElementById('recordedvideo').src = videobase64; 
		        document.getElementById('downloadurl').style.display = '';
		        document.getElementById('downloadurl').href = videobase64;
		        document.getElementById('status').innerHTML = "video="+Math.ceil(videoblob.size / (1024))+"KB, Audio="+Math.ceil(audioblob.size / (1024))+"   Total= "+ (Math.ceil(videoblob.size / (1024))+ Math.ceil(audioblob.size / (1024))) + "KB";
	}

	function setCountDownTime(time){
		 countdownElement.innerHTML = time;
        if(time == 0){
            return -1;
        }else{
            return 1;
        }
    }

    
    function startCountDown(interval){
        if(interval == null){
            functioncalltime = countdowntime; 
            setCountDownTime(--functioncalltime); 
            var intervalcount = setInterval( function(){ startCountDown(intervalcount);  }, 1000 );
        }else{
           var val = setCountDownTime(--functioncalltime); 
           if(val == -1){
               clearInterval(interval);
               virec.stopCapture(oncaptureFinish);
           }
        }
    }

		</script>
	</body>
</html>

```
###Server Side Code
I have used php but you can use any server side language


###Fixes, Changes

1. increased the flexibility of the api
2. provided support for Opera latest version
3. removed the dependancy of JQuery and make it pure javascript
4. uploading time reduced by uploading blob as chunks 
5. old Library previously supported direct mp3 recording using a library provided by [Octavian Naicu](https://github.com/nusofthq/Recordmp3js) but with this version I removed it because of few bugs in that project, and it takes conciderable time to encode to mp3


####This project is an experiment, and this will work Only for Chrome, Opera so all are invited to contribute....

