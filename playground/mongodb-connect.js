const { MongoClient, ObjectID } = require('mongodb');

// Check for any errors when connecting to the database, and print if there are any errors:
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server.');
	}
	console.log('Connected to MongoDB server.');

	// Connect to the ToDoApp database.
	const db = client.db('ToDoApp');

	// Run db.collection to add a new collection to the ToDoApp database, then run insertOne({}) with all the relevant data which needs to be added.
	db.collection('Users').insertOne({
		name: 'Jen',
		age: 29,
		location: 'London'
		// Log any errors which may occur, or if there are no errors console.log the object which has successfully been put into the database.
	}, (err, result) => {
		if(err) return console.log('Unable to insert user.', err);
		console.log(result.ops);
	})
	// End the connection with the database with client.close();
	client.close();
});
