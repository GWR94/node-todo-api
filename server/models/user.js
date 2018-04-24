var mongoose = require('mongoose');

//Models let you predefine what types of data can be input, and if they are required or not etc
var User = mongoose.model('User', {
	email: {
		type: String,
		required: true,
		trim: true,
		minLength: 1,
	},
});

module.exports = {User};
