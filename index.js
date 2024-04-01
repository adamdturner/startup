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



// may not need the following two functions later on


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
      items: [], // Initialize with any structure you deem necessary
      completedItems: [], // Initialize with any structure you deem necessary
      listContributors: [user._id], // Initially, the list includes only the creator as a contributor (TODO use userName instead of user._id)
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
        completedItems: [],
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
apiRouter.post('/groupLists/:listId/items', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { name } = req.body;
  const validation = validateNameNotEmpty(name);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }
  try {
    const list = await DB.getListById('groupLists', req.params.listId, user._id);
    if (!list) {
      return res.status(404).json({ message: "List not found." });
    }
    // Ensure the user is either the creator or a contributor of the list
    if (list.userId.toString() !== user._id.toString() && !list.listContributors.includes(user._id.toString())) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const newItem = {
      id: uuidv4(), // Generates a unique identifier for the item
      name,
    };
    await DB.addItemToList('groupLists', list._id, newItem);
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Add new item to personal list
apiRouter.post('/myLists/:listId/items', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { name } = req.body;
  const validation = validateNameNotEmpty(name);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }
  try {
    const list = await DB.getListById('myLists', req.params.listId, user._id);
    if (!list) {
      return res.status(404).json({ message: "List not found." });
    }
    const newItem = {
      id: uuidv4(), // Generates a unique identifier for the item
      name,
    };
    await DB.addItemToList('myLists', list._id, newItem);
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



// Update item within a group list
apiRouter.put('/groupLists/:listId/items/:itemId', (req, res) => {
  const list = groupLists.find(list => list.id === req.params.listId);
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
apiRouter.put('/groupLists/:listId/completeItem/:itemId', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    // Fetch the list to ensure the user has rights to modify it
    const list = await DB.getListById('groupLists', req.params.listId, user._id);
    if (!list) {
      return res.status(404).json({ message: "List not found." });
    }

    // Verify user is either creator or a contributor
    if (list.userId.toString() !== user._id.toString() && !list.listContributors.includes(user._id.toString())) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Move the item to completedItems
    const updateResult = await DB.moveItemToCompleted('groupLists', req.params.listId, req.params.itemId, user._id);

    if (!updateResult) {
      return res.status(404).json({ message: "Item or list not found." });
    }

    res.json({ message: "Item completed.", item: updateResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Completing a personal list item (move from main list to completed list)
apiRouter.put('/myLists/:listId/completeItem/:itemId', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const updateResult = await DB.moveItemToCompleted('myLists', req.params.listId, req.params.itemId, user._id);

    if (!updateResult) {
      return res.status(404).json({ message: "Item or list not found." });
    }

    res.json({ message: "Item completed.", item: updateResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Marking a group list item as incomplete again (move from completed list back to main list)
apiRouter.put('/groupLists/:listId/reactivateItem/:itemId', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Ensure user has access to the list either as a creator or a contributor
    const list = await DB.getListById('groupLists', req.params.listId, user._id);
    if (!list) {
      return res.status(404).json({ message: "List not found." });
    }
    
    if (list.userId.toString() !== user._id.toString() && !list.listContributors.includes(user._id.toString())) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Reactivate the item
    const updateResult = await DB.reactivateItem('groupLists', req.params.listId, req.params.itemId, user._id);
    if (!updateResult) {
      return res.status(404).json({ message: "Item or list not found." });
    }

    res.json({ message: "Item reactivated.", item: updateResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Marking a personal list item as incomplete again (move from completed list back to main list)
apiRouter.put('/myLists/:listId/reactivateItem/:itemId', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the list belongs to the user
    const list = await DB.getListById('myLists', req.params.listId, user._id);
    if (!list) {
      return res.status(404).json({ message: "List not found." });
    }

    // Reactivate the item
    const updateResult = await DB.reactivateItem('myLists', req.params.listId, req.params.itemId, user._id);
    if (!updateResult) {
      return res.status(404).json({ message: "Item or list not found." });
    }

    res.json({ message: "Item reactivated.", item: updateResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
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

