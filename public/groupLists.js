
function displayUserName() {
  var text = getUserName();
  document.getElementById('userName_placeHolder').innerText = text;
}
  
function getUserName() {
  if (localStorage.getItem("userName") === "") return "No username input";
  else return localStorage.getItem("userName") ?? "No username input";
}

class GroupList {

    constructor() {
        let storedGroupLists = JSON.parse(localStorage.getItem('groupLists')) || [];
        // Ensure each list has a 'completedItems' array
        this.groupLists = storedGroupLists.map(list => ({
            ...list,
            listContributors: list.listContributors || [],
            completedItems: list.completedItems || []
        }));
    }

    createList(listName) {
        fetch('/api/groupLists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: listName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message); // Handle errors or messages from the server
            } else {
                this.fetchAndRenderLists(); // re-fetch the lists from the server to update the UI
            }
        })
        .catch(error => console.error('Error creating list:', error));
    }

    addItemToList(listId, itemName) {
        fetch(`/api/groupLists/${listId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: itemName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Item was successfully created, now you have an ID for the new item
                this.fetchAndRenderLists(); // Refresh or update your list display
            }
        });
    }

    // ***** consider adding id's to users to make it easier later in the authentication phase
    addContributor(listId, userName) {
        fetch(`/api/groupLists/${listId}/contributors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName })
        })
        .then(response => {
            // Check if the request was successful
            if (response.ok) {
                // The contributor was successfully added
                this.fetchAndRenderLists(); // Refresh or update your list display
            } else {
                // Handle non-successful responses
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to add contributor');
                });
            }
        })
        .catch(error => {
            console.error('Error adding contributor:', error);
        });
    }
    

    markItemAsCompleted(listId, itemId) {
        fetch(`/api/groupLists/${listId}/completeItem/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => this.fetchAndRenderLists()) // Assuming you create a new method to fetch lists and render
        .catch(error => console.error('Error completing item:', error));
    }

    returnCompletedItemToMainList(listId, itemId) {
        fetch(`/api/groupLists/${listId}/reactivateItem/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => this.fetchAndRenderLists()) // Assuming you create a new method to fetch lists and render
        .catch(error => console.error('Error reactivating item:', error));
    }

    fetchAndRenderLists() {
        fetch('/api/groupLists')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            this.groupLists = data;
            this.renderLists();
        })
        .catch(error => console.error('Error fetching lists:', error));
    }

    setupEventListeners(listContainer, listId) {
        // Add item functionality
        const addItemButton = listContainer.querySelector('.addItemButton');
        const itemNameInput = listContainer.querySelector('.itemName');
        addItemButton.addEventListener('click', () => {
            this.addItemToList(listId, itemNameInput.value);
            itemNameInput.value = ''; // Clear input after adding
        });
    
        // Move to completed functionality
        listContainer.querySelectorAll('.active-item').forEach(itemElement => {
            itemElement.addEventListener('click', () => {
                const itemId = itemElement.getAttribute('data-item-id');
                this.markItemAsCompleted(listId, itemId);
            });
        });
    
        // Return item to main list functionality
        listContainer.querySelectorAll('.completed-item').forEach(itemElement => {
            itemElement.addEventListener('click', () => {
                const itemId = itemElement.getAttribute('data-item-id');
                this.returnCompletedItemToMainList(listId, itemId);
            });
        });

        // Add contributor functionality
        const userNameInput = listContainer.querySelector('.userName');
        const addContributorButton = listContainer.querySelector('.addContributorButton');
        if (addContributorButton) {
            addContributorButton.addEventListener('click', () => {
                this.addContributor(listId, userNameInput.value);
                userNameInput.value = ''; // Clear input after adding
            });
        } else {
            console.error('Add contributor button not found');
        }
    }

    renderLists() {
        const mainElement = document.querySelector('main');
        mainElement.querySelectorAll('.list-container').forEach(container => container.remove());
    
        this.groupLists.forEach(list => {
            const items = list.items || []; // Assuming this is an array of objects
            const completedItems = list.completedItems || []; // Assuming this as well
            const listContributors = list.listContributors || []; // List of contributors
    
            const listContainer = document.createElement('div');
            listContainer.className = 'list-container';
            listContainer.innerHTML = `
                <div>
                    <h3>${list.name}</h3>
                    <form class="addItemForm">
                        <label for="itemName">Add list item</label>
                        <input type="text" class="itemName" placeholder="item" />
                        <button type="button" class="addItemButton">Add</button>
                    </form>
                    <ul class="list">
                        ${items.map(item => `<li class="active-item" data-item-id="${item.id}">${item.name}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3>Completed Items</h3>
                    <ul class="list">
                        ${completedItems.map(item => `<li class="completed-item" data-item-id="${item.id}">${item.name}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3>Contributors</h3>
                    <form class="addContributorForm">
                        <label for="userName">Add contributor</label>
                        <input type="text" class="userName" placeholder="username" />
                        <button type="button" class="addContributorButton">Add</button>
                    </form>
                    <ul class="list">
                        ${listContributors.map(contributor => `<li class="contributor">${contributor}</li>`).join('')}
                    </ul>
                </div>
            `;
            mainElement.appendChild(listContainer);
            this.setupEventListeners(listContainer, list._id);
        });
    }    
}

const groupList = new GroupList();
groupList.fetchAndRenderLists(); // Initial render

document.getElementById('createGroupListButton').addEventListener('click', () => {
    const listNameInput = document.getElementById('groupListName');
    const listName = listNameInput.value.trim();
    if (listName) {
        groupList.createList(listName);
        listNameInput.value = ''; // Clear input after creating
    } else {
        alert('Please enter a list name.');
    }
});
