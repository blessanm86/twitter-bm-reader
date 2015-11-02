var lowDb = require('lowdb');
var path = require('path');
var merge = require('lodash.merge');

module.exports.getUser = getUser;
module.exports.saveUser = saveUser;

var databasePath = './database';

var usersDb = lowDb(path.join(databasePath, 'users.json'));
usersDb = usersDb('users');


function getUser(username) {
  return usersDb.find({username: username});
}

function saveUser(userData) {
  var newUserObj = {syncCount: 0};

  var userObj = usersDb.find({username: userData.username});

  if(userObj) {
    merge(userObj, userData);
    usersDb.chain().find({username: userData.username}).assign(userObj).value();
  } else {
    merge(newUserObj, userData);
    usersDb.push(newUserObj);
  }
}
