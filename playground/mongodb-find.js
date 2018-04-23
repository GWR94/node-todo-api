const { MongoClient, ObjectID } = require('mongodb');

// Check for any errors when connecting to the database, and print if there are any errors:
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server.');
	}
	console.log('Connected to MongoDB server.');

	// Connect to the ToDoApp database.
	const db = client.db('ToDoApp');

	//Add any paramaters in the find function to search for specific documents
	// db.collection('Todos')
	// 	.find({
	// 		//To search for a specific ID the ObjectID function must be called with the relevant ID.
	// 		_id: new ObjectID('5ade07fe40759b823a6591c1'),
	// 	})
	// 	.toArray()
	// 	.then(
	// 		docs => {
	// 			//Return JSON.stringified version of documents
	// 			console.log('Todos:');
	// 			console.log(JSON.stringify(docs, undefined, 2));
	// 		},
	// 		err => {
	// 			console.log('Unable to fetch todos', err);
	// 		}
	// 	);

	// db
	// 	.collection('Todos')
	// 	//search all documents in Todos collection
	// 	.find()
	// 	//Count each document
	// 	.count()
	// 	//Log records/error
	// 	.then(
	// 		count => {
	// 			console.log(`Todos count: ${count}`);
	// 		},
	// 		err => {
	// 			console.log('Unable to fetch todos', err);
	// 		}
	// 	);

	db
		.collection('Users')
		.find({ name: 'James' })
		.toArray()
		.then(
			docs => {
				console.log('Filtered Users:');
				console.log(JSON.stringify(docs, undefined, 2));
			},
			err => {
				console.log('Unable to fetch todos', err);
			}
		);

	// End the connection with the database with client.close();
	// client.close();
});
