const expect = require('expect');
const request = require('supertest');

const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Todo } = require('../models/todo');

const todos = [
	{
		_id: new ObjectID(),
		text: 'First test todo',
	},
	{
		_id: new ObjectID(),
		text: 'Second test todo',
	},
];

beforeEach(done => {
	Todo.remove({})
		.then(() => {
			Todo.insertMany(todos);
		})
		.then(() => done());
});

describe('POST /todos', () => {
	it('should create a new todo', done => {
		var text = 'Test todo text';
		request(app) //supertest request
			.post('/todos')
			.send({ text })
			.expect(200) //should have a status code of 200 if all went well
			.expect(res => {
				expect(res.body.text).toBe(text); //the body of the response should be the same as the variable set earlier
			})
			.end(err => {
				if (err) {
					return done(err); //if there are any errors, return the error and call done()
				}
				Todo.find({ text })
					.then(todos => {
						expect(todos.length).toBe(1); //there should only be 1 documents as the database is cleared before every test
						expect(todos[0].text).toBe(text); //expect the text of the only document to be the same as the variable set earlier.
						done(); //finish the test
					})
					.catch(e => done(e)); //if theres any errors, finish the test with the error as a parameter
			});
	});

	it('should not create todo with invalid body data', done => {
		request(app)
			.post('/todos')
			.send({}) //send empty body, should fail the test
			.expect(400) //should be a 400 status code - bad request
			.end(err => {
				if (err) return done(err);
				Todo.find()
					.then(todos => {
						expect(todos.length).toBe(2); //should be two as the new document shouldnt have saved if there is invalid data
						done();
					})
					.catch(e => done(e));
			});
	});

	it('should get all todos', done => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect(res => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should return todo document with valid data', done => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	it('should return an 404 error if the objectID is invalid', done => {
		request(app)
			.get('/todos/123')
			.expect(404)
			.end(done);
	});

	it('should return a 404 if the todo is not in the collection, but is a valid ObjectID', done => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('should delete a document from the todos collection by id', done => {
		const hexId = todos[0]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect(res => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(hexId)
					.then(todo => {
						expect(todo).toBeFalsy();
						done();
					})
					.catch(e => done(e));
			});
	});

	it('should return 404 if the ObjectID is invalid', done => {
		request(app)
			.delete(`/todos/abc123`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if the document doesnt exist', done => {
		let hexID = new ObjectID().toHexString();
		request(app)
			.delete(`/todos/${hexID}`)
			.expect(404)
			.end(done);
	});
});
