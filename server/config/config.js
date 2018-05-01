var env = process.env.NODE_ENV || 'development'; // if testing, env would be test, development for localhost, production for heroku
console.log('*** environment:', env, '***');

if(env === 'test' || env === 'development') {
	var config = require('./config.json');
	var envConfig = config[env];

	Object.keys(envConfig).forEach((key) => {
		process.env[key] = envConfig[key];
	});
}