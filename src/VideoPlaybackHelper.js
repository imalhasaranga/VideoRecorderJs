/**
 * Created by imal365 on 3/8/18.
 */
var VideoPlaybackHelper = function () {

    this.stopAndClearPlayback = function (videoElement) {
        this.videoElement = videoElement;
    };

    this.setMedia = function () {
        videoBlobURL = window.URL.createObjectURL(videoblob);
        audioBlobURL = window.URL.createObjectURL(audioblob);
        videoElement.autoplay = false;
        videoElement.src = videoBlobURL;
    };

    this.play = function () {
        videoElement.muted = false;
        videoElement.autoplay = true;
        videoElement.src = videoBlobURL;
        audioElement.src = audioBlobURL;
        videoAudioSync = setTimeout(function () {
            audioElement.currentTime = videoElement.currentTime;
            audioElement.play();
        }, 100);
    }

};