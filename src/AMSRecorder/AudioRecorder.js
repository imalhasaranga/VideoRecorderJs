/**
 * Created by imal365 on 3/7/18.
 */
var AudioRecorder = function (mediaStream, isSterio, deviceSupportedSampleRate) {
    var logger = new Logger();

    config = {};
    var self = this;
    var audioInput;
    var jsAudioNode;
    var bufferSize = 4096;
    var sampleRate = deviceSupportedSampleRate || 44100;
    var numberOfAudioChannels = (!isSterio ? 1 : 2 );
    var leftChannel = [];
    var rightChannel = [];
    var recording = false;
    var recordingLength = 0;
    var isPaused = false;
    var isAudioProcessStarted = false;
    var lock = false;
    var Storage = {};

    logger.debug("isSterio : "+isSterio);
    logger.debug("Device Sample Rate : "+deviceSupportedSampleRate);

    this.firstcall = function () {
        if (!lock) {
            setupStorage();
            audioInput = Storage.ctx.createMediaStreamSource(mediaStream);
            audioInput.connect(jsAudioNode);
            jsAudioNode.onaudioprocess = onAudioProcess;
            lock = true;
        }
    };


    this.start = function () {
        this.firstcall();
        recording = true;
    };

    this.stop = function () {
        recording = false;
    };

    /* callback function is passed to getWAVBlob() thinking that in the future we might export some of the code to a webworker
     * so then we might not be able to do return
     * */
    this.requestBlob = function () {
        this.stop();
        return new Promise(function (resolve) {
            stopRecording(function (blob) {
                resolve({blob : blob, mimeType : blob.type , extension : "wav"});
            });
        });
    };


    function stopRecording(callback) {
        // stop recording
        recording = false;

        // to make sure onaudioprocess stops firing
        audioInput && audioInput.disconnect();
        jsAudioNode && jsAudioNode.disconnect();

        mergeLeftRightBuffers({
            sampleRate: sampleRate,
            numberOfAudioChannels: numberOfAudioChannels,
            internalInterleavedLength: recordingLength,
            leftBuffers: leftChannel,
            rightBuffers: numberOfAudioChannels === 1 ? [] : rightChannel
        }, function (buffer, view) {

            self.blob = new Blob([view], {
                type: 'audio/wav'
            });

            self.buffer = new ArrayBuffer(view.buffer.byteLength);
            self.view = view;
            self.sampleRate = sampleRate;
            self.bufferSize = bufferSize;
            self.length = recordingLength;

            callback && callback(self.blob);

            clearRecordedData();

            isAudioProcessStarted = false;
        });
    }

    function clearRecordedData() {
        leftChannel = rightChannel = [];
        recordingLength = 0;
        isAudioProcessStarted = false;
        recording = false;
        isPaused = false;
    }

    function setupStorage() {
        Storage.ctx = new AudioContext();

        if (Storage.ctx.createJavaScriptNode) {
            jsAudioNode = Storage.ctx.createJavaScriptNode(bufferSize, numberOfAudioChannels, numberOfAudioChannels);
        } else if (Storage.ctx.createScriptProcessor) {
            jsAudioNode = Storage.ctx.createScriptProcessor(bufferSize, numberOfAudioChannels, numberOfAudioChannels);
        } else {
            throw 'WebAudio API has no support on this browser.';
        }

        jsAudioNode.connect(Storage.ctx.destination);
    }


    function onAudioProcess(e) {

        if (isPaused) {
            return;
        }

        if (isMediaStreamActive() === false) {
            if (!config.disableLogs) {
                console.log('MediaStream seems stopped.');
            }
        }

        if (!recording) {
            return;
        }

        if (!isAudioProcessStarted) {
            isAudioProcessStarted = true;
            if (config.onAudioProcessStarted) {
                config.onAudioProcessStarted();
            }

            if (config.initCallback) {
                config.initCallback();
            }
        }

        var left = e.inputBuffer.getChannelData(0);
        leftChannel.push(new Float32Array(left));

        if (numberOfAudioChannels === 2) {
            var right = e.inputBuffer.getChannelData(1);
            rightChannel.push(new Float32Array(right));
        }

        recordingLength += bufferSize;
        self.recordingLength = recordingLength;
    }

    function isMediaStreamActive() {
        if (config.checkForInactiveTracks === false) {
            // always return "true"
            return true;
        }

        if ('active' in mediaStream) {
            if (!mediaStream.active) {
                return false;
            }
        } else if ('ended' in mediaStream) { // old hack
            if (mediaStream.ended) {
                return false;
            }
        }
        return true;
    }

    function mergeLeftRightBuffers(config, callback) {
        function mergeAudioBuffers(config, cb) {
            var numberOfAudioChannels = config.numberOfAudioChannels;

            var leftBuffers = config.leftBuffers.slice(0);
            var rightBuffers = config.rightBuffers.slice(0);
            var sampleRate = config.sampleRate;
            var internalInterleavedLength = config.internalInterleavedLength;
            var desiredSampRate = config.desiredSampRate;

            if (numberOfAudioChannels === 2) {
                leftBuffers = mergeBuffers(leftBuffers, internalInterleavedLength);
                rightBuffers = mergeBuffers(rightBuffers, internalInterleavedLength);
                if (desiredSampRate) {
                    leftBuffers = interpolateArray(leftBuffers, desiredSampRate, sampleRate);
                    rightBuffers = interpolateArray(rightBuffers, desiredSampRate, sampleRate);
                }
            }

            if (numberOfAudioChannels === 1) {
                leftBuffers = mergeBuffers(leftBuffers, internalInterleavedLength);
                if (desiredSampRate) {
                    leftBuffers = interpolateArray(leftBuffers, desiredSampRate, sampleRate);
                }
            }

            // set sample rate as desired sample rate
            if (desiredSampRate) {
                sampleRate = desiredSampRate;
            }

            // for changing the sampling rate, reference:
            // http://stackoverflow.com/a/28977136/552182
            function interpolateArray(data, newSampleRate, oldSampleRate) {
                var fitCount = Math.round(data.length * (newSampleRate / oldSampleRate));
                //var newData = new Array();
                var newData = [];
                //var springFactor = new Number((data.length - 1) / (fitCount - 1));
                var springFactor = Number((data.length - 1) / (fitCount - 1));
                newData[0] = data[0]; // for new allocation
                for (var i = 1; i < fitCount - 1; i++) {
                    var tmp = i * springFactor;
                    //var before = new Number(Math.floor(tmp)).toFixed();
                    //var after = new Number(Math.ceil(tmp)).toFixed();
                    var before = Number(Math.floor(tmp)).toFixed();
                    var after = Number(Math.ceil(tmp)).toFixed();
                    var atPoint = tmp - before;
                    newData[i] = linearInterpolate(data[before], data[after], atPoint);
                }
                newData[fitCount - 1] = data[data.length - 1]; // for new allocation
                return newData;
            }

            function linearInterpolate(before, after, atPoint) {
                return before + (after - before) * atPoint;
            }

            function mergeBuffers(channelBuffer, rLength) {
                var result = new Float64Array(rLength);
                var offset = 0;
                var lng = channelBuffer.length;

                for (var i = 0; i < lng; i++) {
                    var buffer = channelBuffer[i];
                    result.set(buffer, offset);
                    offset += buffer.length;
                }

                return result;
            }

            function interleave(leftChannel, rightChannel) {
                var length = leftChannel.length + rightChannel.length;

                var result = new Float64Array(length);

                var inputIndex = 0;

                for (var index = 0; index < length;) {
                    result[index++] = leftChannel[inputIndex];
                    result[index++] = rightChannel[inputIndex];
                    inputIndex++;
                }
                return result;
            }

            function writeUTFBytes(view, offset, string) {
                var lng = string.length;
                for (var i = 0; i < lng; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            // interleave both channels together
            var interleaved;

            if (numberOfAudioChannels === 2) {
                interleaved = interleave(leftBuffers, rightBuffers);
            }

            if (numberOfAudioChannels === 1) {
                interleaved = leftBuffers;
            }

            var interleavedLength = interleaved.length;

            // create wav file
            var resultingBufferLength = 44 + interleavedLength * 2;

            var buffer = new ArrayBuffer(resultingBufferLength);

            var view = new DataView(buffer);

            // RIFF chunk descriptor/identifier
            writeUTFBytes(view, 0, 'RIFF');

            // RIFF chunk length
            view.setUint32(4, 44 + interleavedLength * 2, true);

            // RIFF type
            writeUTFBytes(view, 8, 'WAVE');

            // format chunk identifier
            // FMT sub-chunk
            writeUTFBytes(view, 12, 'fmt ');

            // format chunk length
            view.setUint32(16, 16, true);

            // sample format (raw)
            view.setUint16(20, 1, true);

            // stereo (2 channels)
            view.setUint16(22, numberOfAudioChannels, true);

            // sample rate
            view.setUint32(24, sampleRate, true);

            // byte rate (sample rate * block align)
            view.setUint32(28, sampleRate * 2, true);

            // block align (channel count * bytes per sample)
            view.setUint16(32, numberOfAudioChannels * 2, true);

            // bits per sample
            view.setUint16(34, 16, true);

            // data sub-chunk
            // data chunk identifier
            writeUTFBytes(view, 36, 'data');

            // data chunk length
            view.setUint32(40, interleavedLength * 2, true);

            // write the PCM samples
            var lng = interleavedLength;
            var index = 44;
            var volume = 1;
            for (var i = 0; i < lng; i++) {
                view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
                index += 2;
            }

            if (cb) {
                return cb({
                    buffer: buffer,
                    view: view
                });
            }

            postMessage({
                buffer: buffer,
                view: view
            });
        }

        var webWorker = processInWebWorker(mergeAudioBuffers);

        webWorker.onmessage = function (event) {
            callback(event.data.buffer, event.data.view);

            // release memory
            URL.revokeObjectURL(webWorker.workerURL);
        };

        webWorker.postMessage(config);
    }

    function processInWebWorker(_function) {
        var workerURL = URL.createObjectURL(new Blob([_function.toString(),
            ';this.onmessage =  function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(workerURL);
        worker.workerURL = workerURL;
        return worker;
    }
};