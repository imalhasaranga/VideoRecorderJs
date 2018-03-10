/**
 * Created by imal365 on 3/10/18.
 */
var WorkerPool = function (workerUrl, numberOfWOrkers) {
    this.logger = new Logger();
    this.pool = [];
    this.index = 0;
    this.onmessageE = null;
    var self = this;
    for (var i = 0; i < numberOfWOrkers; ++i) {
        var worker = new Worker(workerUrl);
        worker.onmessage = function (e) {
            self.onmessageE && self.onmessageE(e);
        };
        this.logger.debug("Worker Created #"+(i+1));
        this.pool.push(worker);
    }
};

WorkerPool.prototype.onmessage = function (onmessage) {
    this.onmessageE = onmessage;
};

WorkerPool.prototype.postMessage = function (arrayofVars) {
    this.pool[this.index].postMessage(arrayofVars);
    ++this.index;
    if(this.index >= this.pool.length){
        this.index = 0;
    }
};

