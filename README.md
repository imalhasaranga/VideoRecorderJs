## VideoAudioRecorderJs

Single Library for Client Side Video & Audio Recording

Older Version of this Project was supporting video audio recording mechanisam implemented using whammy.js and Recorder.js but with the 1.0.0 version release
We have used [MediaStream Recording](https://www.w3.org/TR/mediastream-recording/) Spec as the main recroder but legacy browsers which does not support for this new spec will fallback to old recroder implementation, below are the browsers that are currently supported by the script

* Microsoft Edge
* Chrome
* Firefox
* Opera

Note : Safari is not supported

### Usage
* NPM : `npm install videorecorderjs --save`
* Bower : `bower install videorecorderjs --save`

Or linking script files

```html
<script src="../dist/VideoRecorderJS.min.js" type="text/javascript"></script>
```

Initializing 

```html

    var virec = new VideoRecorderJS.init(
            {
                resize: 0.8,
                webpquality: 0.9,
                framerate: 15,
                videotagid: "viredemovideoele",
                videoWidth: "640",
                videoHeight: "480",
                log: true,
                workerPath : "../dist/recorderWorker.js"
            },
            function () {
                //success callback. this will fire if browsers supports
            },
            function (err) {
                //onerror callback, this will fire for mediaErrors
                if (err.name == "BROWSER_NOT_SUPPORTED") {
                    //handler code goes here
                } else if (err.name == "PermissionDeniedError") {
                    //handler code goes here
                } else if (err.name == "NotFoundError") {
                    //handler code goes here
                } else {
                    throw 'Unidentified Error.....';
                }

            }
    );

```
* `resize` : indicates the recorded video dimentions relative to the actual size
* `webpquality`     : this indicate the quality of a single frame in the video
* `framerate`       : frame rate


### Here is a Complete Example
check the `demo` folder for working example

```html

<html>
<head>
</head>
<body>
<div id="videorecorder">
    <video id="viredemovideoele"></video>
    <span style="font-size:20px;" id="countdown"></span>
</div>

<input id="playback" value="PlayBack" type="button"/>
<input id="clearrecording" value="Clear Recording" type="button"/>
<input id="startRecrodBut1" value="Start Recording" type="button"/>
<input id="stopRecBut1" value="Stop Recording" type="button"/>
<input id="uploadrecord" value="Upload Recording" type="button"/>


</br>
<p id="status"></p>
<video id="recordedvideo" controls></video>
<audio id="audiored" controls></audio>
<a id="downloadurl">Download</a>
<div id="progressNumber" style="font-size:20px;"></div>




<script src="../dist/VideoRecorderJS.min.js" type="text/javascript"></script>

<script type="text/javascript">


    var startRecord = document.getElementById("startRecrodBut1");
    var stopRecord = document.getElementById("stopRecBut1");
    var countdownElement = document.getElementById("countdown");
    var playBackRecord = document.getElementById("playback");
    var discardRecordng = document.getElementById("clearrecording");
    var uploadrecording = document.getElementById("uploadrecord");
    var progressNumber = document.getElementById("progressNumber");


    var virec = new VideoRecorderJS.init(
            {
                resize: 0.8, // recorded video dimentions are 0.4 times smaller than the original
                webpquality: 0.5, // chrome and opera support webp imags, this is about the aulity of a frame
                framerate: 15,  // recording frame rate
                videotagid: "viredemovideoele",
                videoWidth: "640",
                videoHeight: "480",
                log: true,
                mediaRecorderType : "webscript",
                workerPath : "../dist/recorderWorker.js"
            },
            function () {
                //success callback. this will fire if browsers supports
            },
            function (err) {
                //onerror callback, this will fire for mediaErrors
                if (err.name == "BROWSER_NOT_SUPPORTED") {
                    //handler code goes here
                } else if (err.name == "PermissionDeniedError") {
                    //handler code goes here
                } else if (err.name == "NotFoundError") {
                    //handler code goes here
                } else {
                    throw 'Unidentified Error.....';
                }

            }
    );

    startRecord.addEventListener("click", function () {
        virec.startCapture(); // this will start recording video and the audio
        stopCountDown();
        startCountDown();
    });

    stopRecord.addEventListener("click", function () {
        /*
         stops the recording and after recording is finalized oncaptureFinish call back
         will occur
         */
        virec.stopCapture(oncaptureFinish);
        stopCountDown();
    });

    playBackRecord.addEventListener("click", function () {
        /*
         Clientside playback,
         */
        virec.play();
    });

    discardRecordng.addEventListener("click", function () {
        /*
         Clears the current recorded video + audio allowing
         another recording to happen
         */
        virec.clearRecording();
        stopCountDown();
    });

    uploadrecording.addEventListener("click", function () {
        /*
         Uploading the content to the server, here I have sliced the blobs into chunk size
         of 1048576 bits so that uploading time will reduce.
         Gmail uses this same technique when we attach some files to a mail, it slize the file
         in the client side and then uploads chunk by chunk
         */
        var uploadoptions = {
            blobchunksize: 1048576,
            requestUrl: "php/fileupload.php",
            requestParametername: "filename",
            videoname: "video.webm",
            audioname: "audio.wav"
        };
        virec.uploadData(uploadoptions, function (totalchunks, currentchunk) {
            /*
             This function will callback during, each successfull upload of a blob
             so you can use this to show a progress bar or something
             */
            progressNumber.innerHTML = ((currentchunk / totalchunks) * 100);
            console.log(currentchunk + " OF " + totalchunks);
        });
    });


    //------------------------------- few functions that demo, how to play with the api --------------------------

    var countdowntime = 15;
    var functioncalltime = 0;
    var timerInterval = null;

    function oncaptureFinish(result) {
        document.getElementById('status').innerHTML = "";
        result.forEach(function (item) {
            if (item.type == "video") {
                var videoblob = item.blob;
                var videobase64 = window.URL.createObjectURL(videoblob);
                document.getElementById('recordedvideo').src = videobase64;
                document.getElementById('downloadurl').style.display = '';
                document.getElementById('downloadurl').href = videobase64;
                document.getElementById('status').innerHTML = document.getElementById('status').innerHTML + "video=" + Math.ceil(videoblob.size / (1024)) + "KB";

            } else if (item.type == "audio") {
                var audioblob = item.blob;
                document.getElementById('audiored').src = window.URL.createObjectURL(audioblob);
                document.getElementById('status').innerHTML = document.getElementById('status').innerHTML + "Audio=" + Math.ceil(audioblob.size / (1024)) + "KB";
            }
        });
    }

    function setCountDownTime(time) {
        countdownElement.innerHTML = time;
        return time;
    }


    function startCountDown() {
        if (timerInterval == null) {
            functioncalltime = countdowntime;
            var value = setCountDownTime(functioncalltime);
            timerInterval = setInterval(function () {
                var value = setCountDownTime(--functioncalltime);
                if (value == 0) {
                    clearInterval(timerInterval);
                    virec.stopCapture(oncaptureFinish);
                }
            }, 1000);
        }
    }

    function stopCountDown() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }


</script>
</body>
</html>


```
### Server Side Code
I have used php but you can use any server side language


## Change log

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing
**Bug fixes** and **new features** can be proposed using [pull requests](https://github.com/imalhasaranga/VideoRecorderJs/pulls).
Please read the [contribution guidelines](CONTRIBUTION.md) before submitting a pull request.

## Credits

- [Imal Hasaranga Perera](https://github.com/imalhasaranga)
- [All Contributors](../../contributors)


## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

