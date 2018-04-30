require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');


var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		//Create a new document for the Todo collection with the req.body.text from the request
		text: req.body.text,
	});
	todo.save().then(doc => res.send(doc), e => res.status(400).send(e)); //If all goes well, save it and send it.
}); //if theres an error, send that instead and set 400 code.

app.get('/todos/:id', (req, res) => {
	const id = req.params.id;
	if (!ObjectID.isValid(id)) return res.status(404).send(); //if the req.params.id isn't a valid objectID, return a 404 error.
	Todo.findById(id)
		.then(todo => {
			if (!todo) return res.status(404).send(); //if there is no todo, return a 404 status code and empty body
			res.send({ todo }); // else send the todo
		})
		.catch(err => res.status(400).send(err));
});

app.get('/todos', (req, res) => {
	Todo.find().then(
		//find everything in the Todos collection
		todos => res.send({ todos }), //sending the todos array with destructuring allows the option for adding more to send() in the future
		err => res.status(400).send(err) //If there's any errors, set a 400 (Bad request) status code, and send the error.
	);
});

app.delete('/todos/:id', (req, res) => {
	const id = req.params.id;
	if (!ObjectID.isValid(id)) return res.status(404).send(); //if invalid ObjectID, return a 404 error as nothing can be deleted
	Todo.findByIdAndRemove(id)
		.then(todo => {
			if (!todo) {
				return res.status(404).send(); //if the document doesn't exist, return a 404 status code and empty body
			}
			res.send({ todo }); //If there is no problems, delete it and send the document data
		})
		.catch(err => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
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

	Todo.findByIdAndUpdate(id, { $set: body }, { new: true }) //new: false returns the updated document and not the original, $set sets the body on the new document.
		.then(todo => {
			if (!todo) {
				return res.status(404).send(); //if no todo, return a 404 error
			}
			res.send({ todo }); //else send the updated todo 
		})
		.catch(e => res.status(400).send(e)); //if any other errors return a 400 status code
});

app.listen(port, () => {
	console.log(`Server is up on port ${port}`);
});

module.exports = { app };
