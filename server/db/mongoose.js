var mongoose = require('mongoose');

//Set mongoose to run with the local promise library rather than a third party one
mongoose.Promise = global.Promise;
//Connect to the mongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = { mongoose };
