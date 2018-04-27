var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var port = process.env.PORT || 3000;

var app = express();

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
	if (!ObjectID.isValid(id)) return req.status(404).send();
	Todo.findByIdAndRemove(id)
		.then(
			doc => res.send({ doc }), //If there is no problems, delete it and send the document data
			err => res.status(404).send() // if the document doesn't exist, send a 404 and empty body
		)
		.catch(err => res.status(400).send()); 
});

app.listen(port, () => {
	console.log(`Server is up on port ${port}`);
});

module.exports = { app };
