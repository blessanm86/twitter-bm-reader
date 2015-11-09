var pauseable = require('pauseable');
var workerManager = require('./worker-manager');

module.exports = function() {
  var syncInterval = pauseable.setInterval(1000 * 10, function() {
    console.log('Scheduling sync');

    workerManager.addWork({jobName: 'syncUsers'}, function(didSync) {
      if(!didSync) {
        syncInterval.pause(1000 * 30);
      }
    });
  });
}
