require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcryptjs');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

//: POST ://
app.post('/todos', authenticate, (req, res) => {
	var todo = new Todo({
		//Create a new document for the Todo collection with the req.body.text from the request
		text: req.body.text,
		_creator: req.user._id,
	});
	todo.save().then(todo => res.send(todo), e => res.status(400).send(e)); //If all goes well, save it and send it.
}); //if theres an error, send that instead and set 400 code.

app.post('/users', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);
	const user = new User(body);
	user
		.save()
		.then(() => {
			return user.generateAuthToken(); //creates auth token from UserSchema in user.js
		})
		.then(token => {
			res.header('x-auth', token).send(user); //x-auth sets custom header and puts token inside it, then sends the user
		})
		.catch(e => {
			return res.status(400).send(e);
		});
});

app.post('/users/login', (req, res) => {
	const { email, password } = _.pick(req.body, ['email', 'password']);
	User.findByCredentials(email, password)
		.then(user => {
			return user.generateAuthToken().then(token => {
				//return so if theres an error it will be caught in the catch block
				res.header('x-auth', token).send(user);
			});
		})
		.catch(e => res.status(400).send(e));
});

//: GET ://
app.get('/todos/:id', authenticate, (req, res) => {
	const id = req.params.id;
	if (!ObjectID.isValid(id)) return res.status(404).send(); //if the req.params.id isn't a valid objectID, return a 404 error.
	Todo.findOne({ _id: id, _creator: req.user._id })
		.then(todo => {
			if (!todo) return res.status(404).send(); //if there is no todo, return a 404 status code and empty body
			res.send({ todo }); // else send the todo
		})
		.catch(err => res.status(400).send(err));
});

app.get('/users/me', authenticate, (req, res) => {
	//use authenticate middleware
	res.send(req.user);
});

app.get('/todos', authenticate, (req, res) => {
	Todo.find({ _creator: req.user._id }).then(
		//find everything in the Todos collection
		todos => res.send({ todos }), //sending the todos array with destructuring allows the option for adding more to send() in the future
		err => res.status(400).send(err) //If there's any errors, set a 400 (Bad request) status code, and send the error.
	);
});

//: DELETE ://
app.delete('/todos/:id', authenticate, (req, res) => {
	const id = req.params.id;
	if (!ObjectID.isValid(id)) return res.status(404).send(); //if invalid ObjectID, return a 404 error as nothing can be deleted
	Todo.findOneAndRemove({ _id: id, _creator: req.user._id })
		.then(todo => {
			if (!todo) {
				return res.status(404).send(); //if the document doesn't exist, return a 404 status code and empty body
			}
			res.send({ todo }); //If there is no problems, delete it and send the document data
		})
		.catch(err => res.status(400).send(err));
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(
		() => {
			res.send();
		},
		err => {
			res.status(400).send(err);
		}
	);
});

//: PATCH ://
app.patch('/todos/:id', authenticate, (req, res) => {
	const id = req.params.id;
	const body = _.pick(req.body, ['text', 'completed']); //_.pick check the body for the values in the array. Doesn't return any values which are not in the array.
	if (!ObjectID.isValid(id)) return res.status(404).send(); //if the req.params.id isn't a valid objectID, return a 404 error.

	if (_.isBoolean(body.completed) && body.completed) {
		//check if body.completed is a Boolean value, and if it is, if it's true, run the if statement.
		body.completedAt = new Date().getTime(); //returns JS timestamp
	} else {
		//if not a boolean/not true
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, { $set: body }, { new: true }) //new: false returns the updated document and not the original, $set sets the body on the new document.
		.then(todo => {
			if (!todo) {
				return res.status(404).send(); //if no todo, return a 404 error
			}
			res.send({ todo }); //else send the updated todo
		})
		.catch(e => res.status(400).send(e)); //if any other errors return a 400 status code
});

//: LISTEN ://
app.listen(port, () => {
	console.log(`Server is up on port ${port}`);
});

module.exports = { app };
