## HTML5 Video + Audio Recording Component 

This project is using HTML5 getUserMedia() spec to record audio and video in a server less manner 


###Usage 

linking script files 

```html
<script src="http://code.jquery.com/jquery-1.11.0.min.js" type="text/javascript" ></script>
<script src="whammy.js" type="text/javascript"></script>
<script src="recorder.js" type="text/javascript"></script>
<script src="im365.js" type="text/javascript"></script>
```

Create a container


```html
<div  id="videorecorder"  ></div>
```

Create Buttons for Start and stop recording 

```html
<input id="startRecrodBut1" value="Start Recording" type="button" />
<input id="stopRecBut1" value="Stop Recording" type="button"  />
```

Finally initiate the component using the following jquery 

```html
<script type="text/javascript">
		 $(function(){
		      $("#videorecorder").initVideoAudioRec( 
		      	{   quality : 0.4, 
		      		startButtonId : "startRecrodBut1" , 
		      		stopButtonId : "stopRecBut1" ,
		      		videoWidth : "320",
		      		videoHeight : "240",
		      		uploadURL : "php/fileupload.php"
		      	} );
		  });		 
</script>
```
>"quality" : This parameter indicates the quality of the recorded video so lower the value higher the upload speed   


###Here is a Complete Example 

```html

<html>
	<head>
  	</head>
	<body>
		<div  id="videorecorder"  >  
			<input id="startRecrodBut1" value="Start Recording" type="button" />
			<input id="stopRecBut1" value="Stop Recording" type="button"  />
		</div>
		
		<script src="http://code.jquery.com/jquery-1.11.0.min.js" type="text/javascript" ></script>
		<script src="whammy.js" type="text/javascript"></script>
		<script src="recorder.js" type="text/javascript"></script>
		<script src="im365.js" type="text/javascript"></script>

	  	<script type="text/javascript">
		  $(function(){
		      $("#videorecorder").initVideoAudioRec( 
		      	{   quality : 0.4, 
		      		startButtonId : "startRecrodBut1" , 
		      		stopButtonId : "stopRecBut1" ,
		      		videoWidth : "320",
		      		videoHeight : "240",
		      		uploadURL : "php/fileupload.php"
		      	} );
		  });		 
		</script>
	</body>
</html>
>

```

###Fixes 
1. increased the flexibility of the component
2. new audio file is now ridiculously small comparing to the previous one thanks to [Octavian Naicu](https://github.com/nusofthq/Recordmp3js)

####This project is an experiment by me, and this will work Only for Chrome so all are invited to contribute to this Repo 

