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

// get personal lists
async function getListsForUser(userId) {
  return await myListsCollection.find({ userId: userId }).toArray();
}
// get group lists
async function getGroupListsForUser(userId) {
  // Step 1: Fetch the lists
  const lists = await groupListsCollection.find({
    $or: [
      { userId: userId },
      { listContributors: userId }
    ]
  }).toArray();

  // Step 2: Resolve user IDs to usernames for each list
  for (let list of lists) {
    // Transform each userId in listContributors to userName
    const contributorUsernames = await Promise.all(list.listContributors.map(async (contributorId) => {
      const user = await userCollection.findOne({ _id: contributorId });
      return user ? user.userName : "Unknown User";
    }));

    // Replace listContributors with resolved usernames
    list.listContributors = contributorUsernames;
  }
  return lists;
}

// gets a single list from the specified collection
async function getListById(collectionName, listId, userId) {
  let query;
  if (collectionName === 'myLists') {
    query = { _id: listId, userId: userId };
  } else if (collectionName === 'groupLists') {
    query = { _id: listId, $or: [{ userId: userId }, { listContributors: userId }] };
  } else {
    throw new Error('Invalid collection name');
  }
  return await db.collection(collectionName).findOne(query);
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

// database functions for items:

async function addItemToList(collectionName, listId, newItem) {
  const result = await db.collection(collectionName).updateOne(
    { _id: listId },
    { $push: { items: newItem } } // Adjust for "groupItems" if working with group lists
  );
  return result.modifiedCount === 1 ? newItem : null;
}

// pull from items and push to completed items TODO: make sure this works for both group lists and personal lists
async function moveItemToCompleted(collectionName, listId, itemId, userId) {
  // Assuming userId is being correctly matched and is a string in your query
  const pullResult = await db.collection(collectionName).findOneAndUpdate(
    { _id: listId, userId: userId }, // Ensure userId is in the correct format for the query
    { $pull: { items: { id: itemId } } }
  );

  if (pullResult) { // Directly work with pullResult
    const itemToMove = pullResult.items.find(item => item.id === itemId); // Assuming item IDs are strings
    if (itemToMove) {
      const pushResult = await db.collection(collectionName).updateOne(
        { _id: listId },
        { $push: { completedItems: itemToMove } } // Use the correct array based on your schema
      );
      return pushResult.modifiedCount === 1 ? itemToMove : null;
    }
  }
  return null;
}


// pull from completed items and push to items TODO: make sure this works for both group lists and personal lists
async function reactivateItem(collectionName, listId, itemId, userId) {
  // Find the item and pull it from completedItems
  const pullResult = await db.collection(collectionName).findOneAndUpdate(
    { _id: listId, userId: userId },
    { $pull: { completedItems: { id: itemId } } } // Adjust for "groupCompletedItems" if working with group lists
  );
  
  // If successful, push it back to items
  if (pullResult) {
    const itemToMove = pullResult.completedItems.find(item => item.id === itemId);
    if (itemToMove) {
      const pushResult = await db.collection(collectionName).updateOne(
        { _id: listId },
        { $push: { items: itemToMove } } // Adjust for "groupItems" if working with group lists
      );
      return pushResult.modifiedCount === 1 ? itemToMove : null;
    }
  }
  return null;
}

// might not use this but it is good to have for the future in case
async function updateItemName(collectionName, listId, itemId, newName, userId) {
  const result = await db.collection(collectionName).updateOne(
    { _id: listId, "items.id": itemId, userId: userId }, // Adjust for "groupItems.id" if working with group lists
    { $set: { "items.$.name": newName } } // Adjust for "groupItems.$.name" if working with group lists
  );
  
  return result.modifiedCount === 1;
}




module.exports = {
  getUser,
  getUserByToken,
  createUser,

  createList,
  getListsForUser,
  getGroupListsForUser,
  getListById,
  updateList,
  deleteList,

  addItemToList,
  moveItemToCompleted,
  reactivateItem,
  updateItemName
};