/**
 * Created by imal365 on 3/10/18.
 */
var WorkerPool = function (workerUrl, numberOfWOrkers) {
    this.logger = new Logger();
    this.workers = [];
    this.index = 0;
    var self = this;
    for (var i = 0; i < numberOfWOrkers; ++i) {
        this.worker = new Worker(workerUrl);
        this.worker.onmessage = function (e) {
            self.callback && self.callback(e);
        };
        this.logger.debug("Registering worker #"+i);
        this.workers.push(this.worker);
    }
};

WorkerPool.prototype.onmessage = function(callback){
    this.callback = callback;
};

WorkerPool.prototype.postMessage = function (arrayOfMessages) {
    this.logger.debug("posting to : #"+this.index);
    this.workers[this.index].postMessage(arrayOfMessages);
    ++this.index;
    if(this.index >= this.workers.length){
        this.index = 0;
    }
};

