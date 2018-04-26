const { ObjectID } = require('mongodb');
const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

var id = '5ade259171d3249840e8f02f';

User.findById(id)
	.then(user => {
		if (!user) return console.log('User not found');
		console.log('User with id', JSON.stringify(user, undefined, 2));
	})
	.catch(e => console.log(e));

// var id = '5adf6b486cea2831d0d40c9b111';

// if(!ObjectID.isValid(id)) {
// 	console.log('Id not valid');
// }

// Todo.find({
// 	_id: id,
// }).then(todos => {
// 	console.log('Todos:', todos);
// });

// Todo.findOne({
// 	_id: id,
// }).then(todo => {
// 	console.log('Todo:', todo);
// });

// Todo.findById(id).then(todo => {
// 	if(!todo) return console.log('Id not found.');
// 	console.log('Todo by Id:', todo);
// }).catch(e => console.log(e));
