var express = require('express');
var bodyParser = require('body-parser');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({ //Create a new document for the Todo collection with the req.body.text from the request
		text: req.body.text,
	});
	todo.save().then(doc => res.send(doc), e => res.status(400).send(e)); //If all goes well, save it and send it.
}); //if theres an error, send that instead and set 400 code.

app.get('/todos', (req, res) => {
	Todo.find().then( //find everything in the Todos collection
		todos => {
			res.send({ todos }); //sending the todos array with destructuring allows the option for adding more to send() in the future
		},
		e => {
			res.status(400).send(e); //If there's any errors, set a 400 (Bad request) status code, and send the error.
		}
	);
});

app.listen(port, () => {
	console.log(`Server is up on port ${port}`);
});

module.exports = { app };
