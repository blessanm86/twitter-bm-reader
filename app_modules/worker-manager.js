var fork = require('child_process').fork;

module.exports.setup = setup;
module.exports.addWork = addWork;

var workerQueue = [];
var worker;
var isWorking = false;
var callbacks = [];

function setup() {
  createObserverForQueue();
  createAWorker();
}

function addWork(work, callback) {
  callback = callback || function() {};
  callbacks.push(callback);
  workerQueue.push(work);
}

function createObserverForQueue() {
  Array.observe(workerQueue, function(changes) {
    if(changes[0].addedCount && !isWorking) {
      work();
    }
  });
}

function createAWorker() {
  worker = fork('./app_modules/worker.js');

  worker.on('message', function done(name) {
    isWorking = false;
    callbacks.shift()();

    if(workerQueue.length) {
      work();
    }
  });
}

function work() {
  var workName = workerQueue.shift();
  isWorking = true;

  worker.send(workName);
}



