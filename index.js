const express = require('express');
const app = express();

// The service port. In production the frontend code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the frontend static content hosting
app.use(express.static('public'));

// Router for service endpoints
const apiRouter = express.Router();
app.use(`/api`, apiRouter);




let groupLists = []; // This will act as our "database" for now
let myLists = []; // This will act as our "database" for now

// Function to return all group lists (similar to retrieving from localStorage)
const getGroupLists = () => {
    // For now, this simply returns the in-memory storage
    return groupLists;
};
// Function to return all personal lists (similar to retrieving from localStorage)
const getMyLists = () => {
    // For now, this simply returns the in-memory storage
    return myLists;
};
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



//                              List Endpoints here:
// Retrieve all group lists
apiRouter.get('/groupLists', (_req, res) => {
  const lists = getGroupLists(); // retrieve lists from in-memory storage
  res.json(lists);
});

// Retrieve all personal lists
apiRouter.get('/myLists', (_req, res) => {
    const lists = getMyLists(); // retrieve lists from in-memory storage
    res.json(lists);
});

// Create new group list
apiRouter.post('/groupLists', (req, res) => {
    const { name } = req.body;
    const validation = validateListName(name, groupLists);
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    const newList = {
        name,
        groupItems: [],
        groupCompletedItems: [],
        listContributors: [],
    };

    groupLists.push(newList);
    res.status(201).json(newList);
});

// Create new personal list
apiRouter.post('/myLists', (req, res) => {
    const { name } = req.body;
    const validation = validateListName(name, myLists);
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    const newList = {
        name,
        myItems: [],
        myCompletedItems: [],
    };

    myLists.push(newList);
    res.status(201).json(newList);
});



//                              Item Endpoints here:
// Add new item to group list
apiRouter.post('/groupLists/:listId/items', (req, res) => {
    const list = groupLists.find(list => list.id === req.params.listId);
    if (!list) {
        return res.status(404).json({ message: "List not found." });
    }

    const { name } = req.body;
    const validation = validateNameNotEmpty(name);
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }

    const newItem = { id: generateUniqueId(), name }; // generateUniqueId is a placeholder for your ID generation logic
    list.items.push(newItem); // Assuming your list has an 'items' array
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

    const newItem = { id: generateUniqueId(), name }; // generateUniqueId is a placeholder for your ID generation logic
    list.items.push(newItem); // Assuming your list has an 'items' array
    res.status(201).json(newItem);
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


  
//                              Contributor Endpoints here:
// Add contributor to list
apiRouter.post('/lists/:listId/contributors', (req, res) => {
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





// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

