
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

        this.configureWebSocket();
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
                alert(data.message);
            } else {
                this.fetchAndRenderLists(); // re-fetch the lists from the server to update the UI
            }
            this.broadcastEvent(getUserName(), "created a new group list.")
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
                // Item was successfully created
                this.fetchAndRenderLists(); // Refresh or update your list display
            }
        });
    }

    addContributor(listId, userName) {
        fetch(`/api/groupLists/${listId}/contributors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName })
        })
        .then(response => {
            if (response.ok) {
                this.fetchAndRenderLists(); // Refresh or update your list display
            } else {
                // Handle non-successful responses
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to add contributor');
                });
            }
            // broadcast to other users that you added a user to your group list
            this.broadcastEvent(getUserName(),"added a contributor to the list.")
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
        .then(() => this.fetchAndRenderLists())
        .then(() => this.broadcastEvent(getUserName(),"just completed an item."))
        .catch(error => console.error('Error completing item:', error));
    }

    returnCompletedItemToMainList(listId, itemId) {
        fetch(`/api/groupLists/${listId}/reactivateItem/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => this.fetchAndRenderLists())
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
            const items = list.items || [];
            const completedItems = list.completedItems || [];
            const listContributors = list.listContributors || [];
    
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

    configureWebSocket() {
      const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
      this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
      this.socket.onopen = (event) => {
        // message to display when the connection is created
        this.broadcastEvent(getUserName(), "is connected.");
      };
      this.socket.onclose = (event) => {
        // message to display when the connection is closed
        this.broadcastEvent(getUserName(), "is offline.");
      };
      this.socket.onmessage = async (event) => {
        // waits for the event then calls addNotification to display the message
        const msg = JSON.parse(await event.data.text());
        this.addNotification(msg.user, msg.data);
      };
    }

    // Assuming you have a function that is called whenever a new notification is received
    addNotification(username, message) {
      // Create the notification container
      const notificationDiv = document.createElement('div');
      notificationDiv.classList.add('notification');

      // Add the username span
      const userNameSpan = document.createElement('span');
      userNameSpan.classList.add('user-name');
      userNameSpan.textContent = username;
      notificationDiv.appendChild(userNameSpan);

      // Add the message span
      const messageSpan = document.createElement('span');
      messageSpan.classList.add('user-message');
      messageSpan.textContent = message;
      notificationDiv.appendChild(messageSpan);

      // Find the accordion body where the notifications should be displayed
      const accordionBody = document.querySelector('.notification');

      // Append the new notification
      accordionBody.appendChild(notificationDiv);
    }

    broadcastEvent(user, data) {
      const event = {
        user: user,
        data: data,
      };
      this.socket.send(JSON.stringify(event));
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
