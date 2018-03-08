/**
 * Created by imal365 on 3/8/18.
 */
var VideoPlaybackHelper = function (videoElement,audioElement) {

    this.playbackType = 1; //NORMAL = 1, DUAL = 2;
    this.videoElement = videoElement;
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
        if(this.playbackType == 1){
            videoBlobURL = window.URL.createObjectURL(video.blob);
            this.videoElement.autoplay = false;
        }else if(this.playbackType == 2){
            audioBlobURL = window.URL.createObjectURL(audio.blob);
            this.audioElement.src = audioBlobURL;
        }
        this.videoElement.src = videoBlobURL;
    };

    this.play = function () {
        var self = this;
        if(this.playbackType == 1){
            this.videoElement.muted = false;
            this.videoElement.play();
        }else{
            this.videoElement.muted = false;
            this.videoElement.autoplay = true;
            this.videoAudioSync = setTimeout(function () {
                self.currentTime = self.videoElement.currentTime;
                self.audioElement.play();
            }, 100);
        }
    }

};