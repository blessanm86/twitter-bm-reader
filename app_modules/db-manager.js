var lowDb = require('lowdb');
var path = require('path');
var merge = require('lodash.merge');

module.exports.getUser = getUser;
module.exports.saveUser = saveUser;
module.exports.getUsers = getUsers;
module.exports.save = save;

var databasePath = './database';

var DB = lowDb(path.join(databasePath, 'users.json'), {
  autosave: true,
  async: false
});
usersDb = DB('users');


function getUser(username) {
  return usersDb.find({username: username});
}

function saveUser(userData) {console.log('saveUser');
  var newUserObj = {syncCount: 0, tweets: []};

  var userObj = usersDb.find({username: userData.username});

  if(userObj) {
    merge(userObj, userData);
    usersDb.chain().find({username: userData.username}).assign(userObj).value().save();
  } else {
    merge(newUserObj, userData);console.log(newUserObj);
    usersDb.push(newUserObj);
  }
}

function getUsers() {
  return usersDb;
}

function save() {
  DB.save();
}

function addTweets() {
  usersDb.chain().find({username: userData.username}).assign(db.object.test.concat([3,4])).value();
}
