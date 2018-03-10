/**
 * Created by imal365 on 3/8/18.
 */
var VideoPlaybackHelper = function (videoElement,audioElement) {
    var logger = new Logger();
    this.playbackType = 1; //NORMAL = 1, DUAL = 2;
    this.videoElement = videoElement.getPlayableElement();
    this.audioElement = audioElement;

    this.stopAndClearPlayback = function () {
        this.videoAudioSync && clearInterval(this.videoAudioSync);
    };

    this.setMedia = function (mediaArray) {
        var self = this;
        var video;
        var audio;
        this.playbackType = 0;
        mediaArray.some(function(object){
            if(object.type == "video"){
                ++self.playbackType;
                video = object;
            }
            if(object.type == "audio"){
                ++self.playbackType;
                audio = object;
            }
        });
        var videoBlobURL;
        var audioBlobURL;
        if(video){
            videoBlobURL = window.URL.createObjectURL(video.blob);
        }
        if(audio){
            audioBlobURL = window.URL.createObjectURL(audio.blob);
            this.audioElement.src = audioBlobURL;
        }
        this.videoElement.autoplay = false;
        this.videoElement.src = videoBlobURL;
        this.videoElement.currentTime = 0.1;

    };

    this.play = function () {
        var self = this;
        this.videoElement.muted = false;
        if(this.playbackType == 1){
            this.videoElement.play();
        }else{
            this.videoAudioSync = setTimeout(function () {
                self.audioElement.currentTime = self.videoElement.currentTime;
                self.audioElement.play();
            }, 100);
            this.videoElement.playing = function (e) {
                console.log(e)
            };
            this.videoElement.play();
        }
    }

};