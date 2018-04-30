var env = process.env.NODE_ENV || 'development'; // if testing, env would be test, development for localhost, production for heroku
console.log('env ******', env);

if (env === 'development') {
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp'; //set MONGODB_URI to development database
} else if (env === 'test') {
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest'; //set MONGODB_URI to test database
}
