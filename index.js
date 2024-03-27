const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const DB = require('./database.js');
const authCookieName = 'token';

// The service port. In production the frontend code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the frontend static content hosting
app.use(express.static('public'));

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

// Router for service endpoints
const apiRouter = express.Router();
app.use(`/api`, apiRouter);


//********************************** Mock Database and endpoints below ********************************//

// this is important for generating ID's for new items
const { v4: uuidv4 } = require('uuid');

// going to delete these two arrays once the whole database functionality is implemented
let groupLists = []; // This will act as our "database" for now
let myLists = []; // This will act as our "database" for now


// CreateAuth token for a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await DB.getUser(req.body.userName)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await DB.createUser(req.body.userName, req.body.password);
  
    // Set the cookie
    setAuthCookie(res, user.token);
  
    res.send({
      id: user._id,
    });
  }
});
  
// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
  const user = await DB.getUser(req.body.userName);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});
  
// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});




// Check if a list name is used or empty
function validateListName(name, lists) {
  // Check if the name is empty or only whitespace
  if (!name.trim()) {
      return { isValid: false, message: "Name cannot be empty." };
  }
  // Check if the name is already taken
  const listExists = lists.some(list => list.name.trim().toLowerCase() === name.trim().toLowerCase());
  if (listExists) {
      return { isValid: false, message: "Name already exists." };
  }
  // If no issues, the name is valid
  return { isValid: true };
}
// Check if an item name is empty
function validateNameNotEmpty(name) {
  if (!name.trim()) {
      return { isValid: false, message: "Name cannot be empty." };
  }
  return { isValid: true };
}



//                        Endpoints for Lists are here:
// Retrieve all group lists
apiRouter.get('/groupLists', async (req, res) => {
    // Extract the authToken from the request cookies
    const authToken = req.cookies[authCookieName];
    try {
      // Retrieve the user based on the authToken
      const user = await DB.getUserByToken(authToken);
      if (!user) {
        return res.status(401).send({ msg: 'Unauthorized' });
      }
      // Use the user's _id to fetch group lists where they are a contributor or owner
      const lists = await DB.getGroupListsForUser(user._id);
      res.json(lists);
    } catch (error) {
      console.error('Failed to retrieve groupLists:', error);
      res.status(500).send({ msg: 'Failed to retrieve lists' });
    }
  });

// Retrieve all personal lists
apiRouter.get('/myLists', async (req, res) => {
  // Extract the authToken from the request cookies
  const authToken = req.cookies[authCookieName];
  try {
    // Retrieve the user based on the authToken
    const user = await DB.getUserByToken(authToken);
    if (!user) {
      return res.status(401).send({ msg: 'Unauthorized' });
    }
    // Use the user's _id to fetch their personal lists
    const lists = await DB.getListsForUser(user._id);
    res.json(lists);
  } catch (error) {
    console.error('Failed to retrieve myLists:', error);
    res.status(500).send({ msg: 'Failed to retrieve lists' });
  }
});

// Create new group list
apiRouter.post('/groupLists', async (req, res) => {
    try {
      const user = await DB.getUserByToken(req.cookies[authCookieName]);
      if (!user) {
        return res.status(401).send({ msg: 'Unauthorized' });
      }
      const { name } = req.body;
      const validation = validateListName(name, await DB.getGroupListsForUser(user._id));
      if (!validation.isValid) {
          return res.status(400).json({ message: validation.message });
      }
      // Construct the new list document
      const newList = {
        _id: uuidv4(),
        name,
        groupItems: [], // Initialize with any structure you deem necessary
        groupCompletedItems: [], // Initialize with any structure you deem necessary
        listContributors: [user._id], // Initially, the list includes only the creator as a contributor
        userId: user._id, // This associates the list with the user who created it
      };
      // Insert the new list into the database
      await DB.createList('groupLists', newList); // Make sure this function is implemented in database.js
      res.status(201).json(newList);
    } catch (error) {
      console.error('Failed to create groupList:', error);
      res.status(500).send({ msg: 'Failed to create list' });
    }
  });

// Create new personal list with userId
apiRouter.post('/myLists', async (req, res) => {
  try {
    const user = await DB.getUserByToken(req.cookies[authCookieName]);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.body;
    const validation = validateListName(name, myLists);
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    const newList = { 
        _id: uuidv4(), 
        name, 
        items: [], 
        myCompletedItems: [],
        userId: user._id // Associate list with userId
    };
    // Insert the new list into the database
    await DB.createList('myLists', newList); // Make sure this function is implemented in database.js
    res.status(201).json(newList);
  } catch (error) {
    console.error('Failed to create personal list:', error);
    res.status(500).send({ msg: 'Failed to create list' });
  }
});



//                              Endpoints for Items are here:
// Add new item to group list
apiRouter.post('/groupLists/:listId/groupItems', (req, res) => {
  const list = groupLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }

  const { name } = req.body;
  const validation = validateNameNotEmpty(name);
  if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
  }

  const newItem = {
      id: uuidv4(), // Generates a unique identifier for the item
      name: req.body.name,
  };    
  list.groupItems.push(newItem); // Assuming your list has an 'items' array
  res.status(201).json(newItem);
});

// Add new item to personal list
apiRouter.post('/myLists/:listId/items', (req, res) => {
  const list = myLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }
  const { name } = req.body;
  const validation = validateNameNotEmpty(name);
  if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
  }

  const newItem = {
      id: uuidv4(), // Generates a unique identifier for the item
      name: req.body.name,
  };    
  list.items.push(newItem); // Assuming your list has an 'items' array
  res.status(201).json(newItem);
});


// Update item within a group list
apiRouter.put('/groupLists/:listId/items/:itemId', (req, res) => {
  const list = groupLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }

  const item = list.groupItems.find(item => item.id === req.params.itemId);
  if (!item) {
      return res.status(404).json({ message: "Item not found." });
  }

  const { name } = req.body;
  const validation = validateNameNotEmpty(name);
  if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
  }

  item.name = name; // Update the item's name
  res.json(item);
});

// Update item within a personal list
apiRouter.put('/myLists/:listId/items/:itemId', (req, res) => {
  const list = myLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }

  const item = list.items.find(item => item.id === req.params.itemId);
  if (!item) {
      return res.status(404).json({ message: "Item not found." });
  }

  const { name } = req.body;
  const validation = validateNameNotEmpty(name);
  if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
  }

  item.name = name; // Update the item's name
  res.json(item);
});


// Completing a group list item (move from main list to completed list)
apiRouter.put('/groupLists/:listId/completeItem/:itemId', (req, res) => {
  const list = groupLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }

  const itemIndex = list.groupItems.findIndex(item => item.id === req.params.itemId);
  if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found." });
  }

  // Move the item to completed items
  const [completedItem] = list.groupItems.splice(itemIndex, 1);
  list.groupCompletedItems.push(completedItem);

  res.json({ message: "Item completed.", item: completedItem });
});


// Completing a personal list item (move from main list to completed list)
apiRouter.put('/myLists/:listId/completeItem/:itemId', (req, res) => {
  const list = myLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }

  const itemIndex = list.items.findIndex(item => item.id === req.params.itemId);
  if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found." });
  }

  // Move the item to completed items
  const [completedItem] = list.items.splice(itemIndex, 1);
  list.myCompletedItems.push(completedItem);

  res.json({ message: "Item completed.", item: completedItem });
});

// Marking a group list item as incomplete again (move from completed list back to main list)
apiRouter.put('/groupLists/:listId/reactivateItem/:itemId', (req, res) => {
  const list = groupLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }

  const itemIndex = list.groupCompletedItems.findIndex(item => item.id === req.params.itemId);
  if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found." });
  }

  // Move the item back to active items
  const [reactivatedItem] = list.groupCompletedItems.splice(itemIndex, 1);
  list.groupItems.push(reactivatedItem);

  res.json({ message: "Item reactivated.", item: reactivatedItem });
});

// Marking a personal list item as incomplete again (move from completed list back to main list)
apiRouter.put('/myLists/:listId/reactivateItem/:itemId', (req, res) => {
  const list = myLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }

  const itemIndex = list.myCompletedItems.findIndex(item => item.id === req.params.itemId);
  if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found." });
  }

  // Move the item back to active items
  const [reactivatedItem] = list.myCompletedItems.splice(itemIndex, 1);
  list.items.push(reactivatedItem);

  res.json({ message: "Item reactivated.", item: reactivatedItem });
});



  
//                              Endpoints for Contributors here:

// Add contributor to group list *********** consider adding user id's later (like how items have an id) so that authentication is easier
apiRouter.post('/groupLists/:listId/contributors', (req, res) => {
  const list = groupLists.find(list => list.id === req.params.listId);
  if (!list) {
      return res.status(404).json({ message: "List not found." });
  }

  const { name } = req.body;
  const validation = validateNameNotEmpty(name);
  if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
  }

  // Assuming listContributors is an array of contributor names
  if (!list.listContributors.includes(name)) {
      list.listContributors.push(name);
      res.status(201).json({ message: "Contributor added.", contributor: name });
  } else {
      res.status(409).json({ message: "Contributor already exists." });
  }
});


//********************************** End of endpoints **********************************//


// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
  secure: true,
  httpOnly: true,
  sameSite: 'strict',
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

