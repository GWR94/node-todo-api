const expect = require('expect');
const request = require('supertest');

const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
	it('should create a new todo', done => {
		var text = 'Test todo text';
		request(app) //supertest request
			.post('/todos')
			.set('x-auth', users[0].tokens[0].token)
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
			.set('x-auth', users[0].tokens[0].token)			
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
			.set('x-auth', users[0].tokens[0].token)			
			.expect(200)
			.expect(res => {
				expect(res.body.todos.length).toBe(1);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should return todo document with valid data', done => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)						
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	it('should return an 404 error if the objectID is invalid', done => {
		request(app)
			.get('/todos/123')
			.set('x-auth', users[0].tokens[0].token)						
			.expect(404)
			.end(done);
	});

	it('should return a 404 if the todo is not in the collection, but is a valid ObjectID', done => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)			
			.expect(404)
			.end(done);
	});

	it('should not return todo document created by another user', done => {
		request(app)
			.get(`/todos/${todos[1]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)						
			.expect(404)
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('should delete a document from the todos collection by id', done => {
		const hexId = todos[1]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)									
			.expect(200)
			.expect(res => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err) => {
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

	it('should not delete a todo which the user is not authorised to do', done => {
		const hexId = todos[0]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)									
			.expect(404)
			.end((err) => {
				if (err) {
					return done(err);
				}
				Todo.findById(hexId)
					.then(todo => {
						expect(todo).toBeTruthy();
						done();
					})
					.catch(e => done(e));
			});
	});

	it('should return 404 if the ObjectID is invalid', done => {
		request(app)
			.delete(`/todos/abc123`)
			.set('x-auth', users[1].tokens[0].token)												
			.expect(404)
			.end(done);
	});

	it('should return 404 if the document doesnt exist', done => {
		let hexID = new ObjectID().toHexString();
		request(app)
			.delete(`/todos/${hexID}`)
			.set('x-auth', users[1].tokens[0].token)												
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	it('should update the todo and completedAt fields when updating', done => {
		const id = todos[0]._id;
		const text = 'updated first test todo';
		request(app)
			.patch(`/todos/${id}`)
			.set('x-auth', users[0].tokens[0].token)			
			.send({ completed: true, text })
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(true);
				expect(typeof res.body.todo.completedAt).toBe('number');
			})
			.end(done);
	});

	it('should clear completedAt when todo is set to be not completed', done => {
		const id = todos[1]._id.toHexString();
		const text = 'updated second test todo';
		request(app)
			.patch(`/todos/${id}`)
			.set('x-auth', users[1].tokens[0].token)			
			.send({ completed: false, text })
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toBeFalsy();
			})
			.end(done);
	});

	it('should not update anything when an incorrect objectID is input', done => {
		const text = 'test fail';
		request(app)
			.patch('/todos/abc123')
			.set('x-auth', users[1].tokens[0].token)															
			.send({ completed: false, text })
			.expect(404)
			.end(done);
	});
});

describe('GET /users', () => {
	it('should return user if authenticated', done => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token) //set header
			.expect(200)
			.expect(res => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it('should return a 401 if not authenticated', done => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect(res => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('POST /users', () => {
	it('should create a user', done => {
		const email = 'example@example.com';
		const password = 'password123';
		request(app)
			.post('/users')
			.send({ email, password })
			.expect(200)
			.expect(res => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(typeof res.body._id).toBe('string');
				expect(res.body.email).toBe(email);
			})
			.end(err => {
				if (err) return done(err);
				User.findOne({ email })
					.then(user => {
						expect(user).toBeTruthy();
						expect(user.password).not.toBe(password);
						done();
					})
					.catch(e => done(e));
			});
	});

	it('should return validation errors if email is invalid', done => {
		const email = 'testfailingemail'; //should throw error as it's not a valid email
		const password = 'password123';
		request(app)
			.post('/users')
			.send({ email, password })
			.expect(400)
			.expect(res => {
				expect(res.body._message).toBe('User validation failed');
			})
			.end(done);
	});

	it('should return validation errors if password is invalid', done => {
		const email = 'test@test.com';
		const password = 'fail'; //should throw an error as it's too short
		request(app)
			.post('/users')
			.send({ email, password })
			.expect(400)
			.expect(res => {
				expect(res.body._message).toBe('User validation failed');
			})
			.end(done);
	});

	it('should not create a user if email is in use', done => {
		const email = 'james@example.com'; //email address is already in use
		const password = 'password123';
		request(app)
			.post('/users')
			.send({ email, password })
			.expect(400)
			.end(done);
	});
});

describe('POST /users/login', () => {
	it('should login user and return auth token', done => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password,
			})
			.expect(200)
			.expect(res => {
				expect(res.headers['x-auth']).toBeTruthy();
			})
			.end((err, res) => {
				if (err) return done(err);
				User.findById(users[1]._id)
					.then(user => {
						expect(user.tokens[1].access).toBe('auth');
						expect(user.tokens[1].token).toBe(res.headers['x-auth']);
						done();
					})
					.catch(e => done(e));
			});
	});

	it('should reject invalid login', done => {
		const password = 'passToFail'; //should throw error
		request(app)
			.post('/users/login')
			.send({ email: users[1].email, password })
			.expect(400)
			.expect(res => {
				expect(res.headers['x-auth']).toBeUndefined();
			})
			.end(err => {
				if (err) return done(err);
				User.findById(users[1]._id)
					.then(user => {
						expect(user.tokens.length).toBe(1);
						done();
					})
					.catch(e => done(e));
			});
	});
});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', done => {
		request(app)
			.delete('/users/me/token')
			.set('x-auth', users[0].tokens[0].token) //set correct x-auth header
			.expect(200)
			.end(err => {
				if (err) return done(err); //if any errors, return to catch block
				User.findById(users[0]._id)
					.then(user => {
						expect(user.tokens.length).toBe(0); //expect there to be no token in tokens array
						done();
					})
					.catch(e => done(e));
			});
	});
});
