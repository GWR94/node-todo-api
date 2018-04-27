const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// Todo.remove({}).then(res => console.log(res)); //to remove everything from Todo collection - remove doesnt return the data which is removed.
// Todo.findOneAndRemove() //finds and deletes one document, and can return that data to the user

// Todo.findByIdAndRemove('5ae2fc3c947c72c06cfb18f5').then(doc => {
// 	console.log(doc);
// });

Todo.findOneAndRemove({text: 'Walk the dog'}).then(doc => console.log(doc));
