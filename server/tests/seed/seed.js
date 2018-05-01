const { ObjectID } = require('mongodb');
const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
	{
		_id: userOneId,
		email: 'james@example.com',
		password: 'password1',
		tokens: [
			{
				access: 'auth',
				token: jwt.sign({ _id: userOneId, access: 'auth' }, '123abc').toString(),
			},
		],
	},
	{
		_id: userTwoId,
		email: 'bill@example.com',
		password: 'password2',
	},
];

const todos = [
	{
		_id: new ObjectID(),
		text: 'First test todo',
	},
	{
		_id: new ObjectID(),
		text: 'Second test todo',
		completed: true,
		completedAt: 123456,
	},
];

const populateTodos = done => {
	Todo.remove({})
		.then(() => {
			Todo.insertMany(todos);
		})
		.then(() => done());
};

const populateUsers = done => {
	User.remove({})
		.then(() => {
			var user1 = new User(users[0]).save();
			var user2 = new User(users[1]).save();

			return Promise.all([user1, user2]);
		})
		.then(() => done());
};

module.exports = { todos, populateTodos, populateUsers, users };
