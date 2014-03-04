## HTML5 Video + Audio Recording Component 

This project is using HTML5 getUserMedia() spec to record audio and video in a server less manner 

=

###Project is having few dependencies

1. [JQuery](http://code.jquery.com/jquery-1.11.0.min.js)
2. [whammy.js](https://github.com/antimatter15/whammy)
3. [recorder.js](https://github.com/mattdiamond/Recorderjs)
4. [recorderWorker.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)

=

###Usage 

linking script files 

```html
<script src="http://code.jquery.com/jquery-1.11.0.min.js" type="text/javascript" ></script>
<script src="whammy.js" type="text/javascript"></script>
<script src="recorder.js" type="text/javascript"></script>
<script src="im365.js" type="text/javascript"></script>
```

Create a div element and set the parameters for 

> data-uploadurl   		 (Indicates the uploading url after recording has completed)
> data-videowidth  		 (Video Recorder Width) 
> data-videoheight="300" (Video Recorder Height)

```html
<div style="width:300px; height:400px;" 
			 id="videorecorder"  
			 data-uploadurl="fileupload.php" 
			 data-videowidth="300" 
			 data-videoheight="300" >  
		
			
</div>
```

Create Buttons for Start and stop recording 

```html
<input id="startRecrodBut" value="Start Recording" type="button" />
<input id="stopRecBut" value="Stop Recording" type="button"  />
```

Finally initiate the component using the following jquery 

```html
<script type="text/javascript">
		  $(function(){
		      $("#videorecorder").initVideoAudioRec();
		  });		 
</script>
```

###Here is a Complete Example 

```html

<html>
	<head>
  	</head>
	<body>
		<div style="width:300px; height:400px;" 
			 id="videorecorder"  
			 data-uploadurl="fileupload.php" 
			 data-videowidth="300" 
			 data-videoheight="300" >  
		
			<input id="startRecrodBut" value="Start Recording" type="button" />
			<input id="stopRecBut" value="Stop Recording" type="button"  />
		</div>


		<script src="http://code.jquery.com/jquery-1.11.0.min.js" type="text/javascript" ></script>
		<script src="whammy.js" type="text/javascript"></script>
		<script src="recorder.js" type="text/javascript"></script>
		<script src="im365.js" type="text/javascript"></script>

	  	<script type="text/javascript">
		  $(function(){
		      $("#videorecorder").initVideoAudioRec();
		  });		 
		</script>
	</body>
</html>

```

####This project is an experiment by me, and this will work Only for Chrome so all are invited to contribute to this Repo 

