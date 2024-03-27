const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // generating unique ID's
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');
const userCollection = db.collection('user');
const myListsCollection = db.collection('myLists');
const groupListsCollection = db.collection('groupLists');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  await client.connect();
  await db.command({ ping: 1 });
})().catch((ex) => {
  console.log(`Unable to connect to database with ${url} because ${ex.message}`);
  process.exit(1);
});

// database functions for users:

async function getUser(userName) {
  return userCollection.findOne({ userName: userName });
}

async function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function createUser(userName, password) {
  // Hash the password before we insert it into the database
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    userName: userName,
    password: passwordHash,
    token: uuidv4(),
  };
  await userCollection.insertOne(user);

  return user;
}

// database functions for lists:

async function createList(collection, listData) {
  await db.collection(collection).insertOne(listData);
  return listData; // Return the list with MongoDB generated _id
}

async function getListsForUser(userId) {
  return await myListsCollection.find({ userId: userId }).toArray();
}

async function getGroupListsForUser(userId) {
  return await groupListsCollection.find({
    $or: [
      { userId: userId }, // Lists created by the user
      { listContributors: userId } // Lists where the user is a contributor
    ]
  }).toArray();
}

async function updateList(collection, listId, updates) {
  const { value } = await db.collection(collection).findOneAndUpdate(
    { _id: listId },
    { $set: updates },
    { returnDocument: 'after' } // This option returns the document after update
  );
  return value;
}

async function deleteList(collection, listId) {
  await db.collection(collection).deleteOne({ _id: listId });
}

module.exports = {
  getUser,
  getUserByToken,
  createUser,

  createList,
  getListsForUser,
  getGroupListsForUser,
  updateList,
  deleteList,
};