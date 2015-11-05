var fork = require('child_process').fork;

// module.exports.addWork = addWork;

// var workerQueue = [];
// var worker;
// var isWorking = false;
// var callbacks = [];

// //setup
// createObserverForQueue();
// createAWorker();

// function addWork(work, callback) {
//   callback = callback || function() {};
//   callbacks.push(callback);
//   workerQueue.push(work);
// }

// function createObserverForQueue() {
//   Array.observe(workerQueue, function(changes) {
//     if(changes[0].addedCount && !isWorking) {
//       work();
//     }
//   });
// }

// function createAWorker() {
//   worker = fork('./app_modules/worker.js');

//   worker.on('message', function done(message) {
//     isWorking = false;
//     callbacks.shift()(message);

//     if(workerQueue.length) {
//       work();
//     }
//   });
// }

// function work() {
//   var workName = workerQueue.shift();
//   isWorking = true;

//   worker.send(workName);
// }

function QueueManager() {console.log('QueueManager init');
  var workerQueue = [];
  var worker;
  var isWorking = false;
  var callbacks = [];

  function createObserverForQueue() {
    Array.observe(workerQueue, function(changes) {
      if(changes[0].addedCount && !isWorking) {
        work();
      }
    });
  }

  function createAWorker() {
    worker = fork('./app_modules/worker.js');

    // worker.on('message', function done(message) {
    //   isWorking = false;
    //   callbacks.shift()(message);

    //   if(workerQueue.length) {
    //     work();
    //   }
    // });
  }

  function work() {
    var workName = workerQueue.shift();
    isWorking = true;

    worker.send(workName);
  }

  createObserverForQueue();
  createAWorker();

  this.addWork = function(work, callback) {
    callback = callback || function() {};
    callbacks.push(callback);
    workerQueue.push(work);
  }
}

module.exports = exports = new QueueManager();

// module.exports = exports = function() {
//   console.log('wtf');
// }();



