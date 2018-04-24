const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const { Todo } = require('../models/todo');

beforeEach(done => {
	Todo.remove({}).then(() => done());
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
			.end((err, res) => {
				if (err) {
					return done(err); //if there are any errors, return the error and call done()
				}
				Todo.find()
					.then(todos => {
						expect(todos.length).toBe(1); //there should only be 1 documents as the database is cleared before every test
						expect(todos[0].text).toBe(text); //expect the text of the only document to be the same as the variable set earlier.
						done(); //finish the test
					})
					.catch(e => done(e)); //if theres any errors, finish the test with the error as a paramater
			});
	});
	it('should not create todo with invalid body data', done => {
		request(app)
			.post('/todos')
			.send({}) //send empty body, should fail the test
			.expect(400) //should be a 400 status code - bad request
			.end((err, res) => {
				if (err) return done(err);
				Todo.find()
					.then(todos => {
						expect(todos.length).toBe(0); //should be zero as it shouldnt have saved if there is invalid data
						done();
					})
					.catch(e => done(e));
			});
	});
});
