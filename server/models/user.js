const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true, //do not allow multiple user accounts from one email
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email',
		},
	},
	password: {
		type: String,
		require: true,
		minlength: 8,
	},
	tokens: [
		{
			access: {
				type: String,
				required: true,
			},
			token: {
				type: String,
				required: true,
			},
		},
	],
});

UserSchema.methods.toJSON = function() { //toJSON returns only the relevant data to the user
	const user = this;
	const userObj = user.toObject();
	return _.pick(userObj, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
	var user = this; //get user data
	var access = 'auth';
	var token = jwt.sign({ _id: user._id.toHexString(), access }, '123abc');

	user.tokens = user.tokens.concat([{ access, token }]);

	return user.save().then(() => {
		return token; //return token if successful
	});
};

//Models let you predefine what types of data can be input, and if they are required or not etc
var User = mongoose.model('User', UserSchema);

module.exports = { User };
