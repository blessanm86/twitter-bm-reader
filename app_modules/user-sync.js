var workerManager = require('./worker-manager');

module.exports = function() {
  function startSyncing() {
    var syncTimerId = setInterval(function() {
      console.log('Scheduling sync');

      workerManager.addWork({jobName: 'syncUsers'}, function(didSync) {
        if(!didSync) {
          clearInterval(syncTimerId);
          setTimeout(startSyncing, 1000 * 30);
        }
      });
    }, 1000 * 10);
  }

  startSyncing();
}
