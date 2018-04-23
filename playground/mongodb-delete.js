const { MongoClient, ObjectID } = require('mongodb');

// Check for any errors when connecting to the database, and print if there are any errors:
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server.');
	}
	console.log('Connected to MongoDB server.');

	// Connect to the ToDoApp database.
	const db = client.db('ToDoApp');

	//deleteMany
	// db
	// 	.collection('Todos')
	// 	.deleteMany({ text: 'Eat lunch' })
	// 	.then(res => console.log(res), err => console.log(err));

	//deleteOne
	// db
	// 	.collection('Todos')
	// 	.deleteOne({ text: 'Eat lunch' })
	// 	.then(res => console.log(res), err => console.log(err));

	//findOneAndDelete
	// db
	// 	.collection('Todos')
	// 	.findOneAndDelete({ completed: false })
	// 	.then(res => console.log(res), err => console.log(err));

	// ! Challenge part 1: Delete all users with duplicate names
	// db
	// 	.collection('Users')
	// 	.deleteMany({ name: 'James'})
	// 	.then(res => console.log(res), err => console.log(err));

	// ! Challenge part 2: Remove one user by id
	var _id = new ObjectID('5ade0bf3ec3a71c178653a5d');
	db
		.collection('Users')
		.findOneAndDelete({ _id })
		.then(res => console.log(JSON.stringify(res, undefined, 2)), err => console.log(err));

	// client.close();
});
