const { MongoClient, ObjectID } = require('mongodb');

// Check for any errors when connecting to the database, and print if there are any errors:
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server.');
	}
	console.log('Connected to MongoDB server.');

	// Connect to the ToDoApp database.
	const db = client.db('ToDoApp');

	// db
	// 	.collection('Todos')
	// 	.findOneAndUpdate(
	// 		// first find the document which matches the criteria below
	// 		{
	// 			_id: new ObjectID('5ade126640759b823a65940b'),
	// 		},
	// 		{
	// 			//$set lets you set the value of the one found item
	// 			$set: {
	// 				completed: true,
	// 			},
	// 		},
	// 		{
	// 			//returnOriginal needs to be set to false to return the updated document rather than the original.
	// 			returnOriginal: false,
	// 		}
	// 	)
	// 	.then(res => console.log(res));

	// ! Challenge: Update the users collection to change the name of the user to 'James'
	db
		.collection('Users')
		.findOneAndUpdate(
			{
				name: 'James'
			},
			{
				//document to change
				$set: {
					location: 'Tonbridge'
				},
					age: 23,
					//document to increment & value to increment by
				$inc: {
					age: 1
				}
			},
			{
				returnOriginal: false
			}
		)
		.then(res => console.log(res));
	// client.close();
});
