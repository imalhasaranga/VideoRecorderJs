var NetworkManager = function (configs) {
    this.INIT_URL = "http://ec2-54-67-121-210.us-west-1.compute.amazonaws.com:8080/init";
    this.FRAME_URL = "http://ec2-54-67-121-210.us-west-1.compute.amazonaws.com:8080/frames";
    this.FRAMES_URL = "http://ec2-54-67-121-210.us-west-1.compute.amazonaws.com:8080/framesarr";
    this.ENCODE_URL = "http://ec2-54-67-121-210.us-west-1.compute.amazonaws.com:8080/encode";
    this.WEBP_URL = "http://ec2-54-67-121-210.us-west-1.compute.amazonaws.com:8080/webp";
    this.batchSize = configs.batchSize;
    this.frames = [];
    this.tempFrames = [];
    this.requests = [];
    this.processingRequestCount = 0;
    this.sToken = null;
    var self = this;
    this.encodeSuccessCallback = null;
    this.needToSendEncodeReq = false;
    this.fps = 25;
    this.workerPool = new WorkerPool("src/net-worker.js", 3);
};

NetworkManager.prototype.pushFrame = function (frame, index) {
    this.frames.push({
        key: "_idx" + index,
        frame: frame
    });

    if (this.frames.length == this.batchSize) {
        this.tempFrames = this.frames;
        this.frames = [];
        this.sendFrames();
    }
}

NetworkManager.prototype.sendFrames = function () {
    var self = this;
    console.log("sending frames to " + self.sToken);
    var postData = self.toPost(self.tempFrames);
    postData.append("stoken", self.sToken);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            self.processingRequestCount--;
            if (self.needToSendEncodeReq && self.processingRequestCount == 0) {
                self.encode(self.fps, self.encodeSuccessCallback);
            }
        }

    }
    xhttp.open('POST', self.FRAMES_URL);
    xhttp.send(postData);
    self.requests.push(xhttp);
    self.processingRequestCount++;

}

NetworkManager.prototype.toPost = function (frames) {
    var post = new FormData();
    frames.forEach(function (x) {
        post.append("_idx" + x.key, x.frame);
    });
    return post;
}

NetworkManager.prototype.encode = function (fps, resolve) {
    this.encodeSuccessCallback = resolve;


   if(this.frames.length > 0){
       this.tempFrames = this.frames;
       this.frames = [];
       this.sendFrames();
   }

    if (this.processingRequestCount > 0) {
        this.needToSendEncodeReq = true;
        this.fps = fps;
        return;
    }
    console.log("encoding to " + this.sToken);
    var postData = new FormData();
    postData.append("stoken", this.sToken);
    postData.append("fps", fps);
    var xhttp = new XMLHttpRequest();
    xhttp.responseType = "arraybuffer";
    var self = this;
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("ENCODING SUCCESS. VIDEO RECIVED");
        }
    }
    xhttp.open('POST', this.ENCODE_URL, true);
    xhttp.onload = function(oEvent){
      var blob = new Blob([xhttp.response], {type: "video/mp4"});
      self.encodeSuccessCallback(blob);
    };
    xhttp.send(postData);
    this.requests.push(xhttp);
}

NetworkManager.prototype.init = function () {
    var xhttp = new XMLHttpRequest();
    var self = this;
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            self.sToken = JSON.parse(this.responseText).sToken;
            console.log("stoken is " + self.sToken);
        }
    }
    xhttp.open('GET', this.INIT_URL);
    xhttp.send();
    this.requests.push(xhttp);
}

NetworkManager.prototype.toWebp = function(image, index, callback) {
    var postData = new FormData();
    postData.append("stoken", this.sToken);
    postData.append("image", image);
    postData.append("index", index);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("ENCODING SUCCESS. IMAGE RECIVED " + index);
            callback(this.responseText, index);
        }
    }
    xhttp.open('POST', this.WEBP_URL);
    xhttp.send(postData);
    this.requests.push(xhttp);
}


