
function displayUserName() {
  var text = getUserName();
  document.getElementById('userName_placeHolder').innerText = text;
}

function getUserName() {
  if (localStorage.getItem("userName") === "") return "No username input";
  else return localStorage.getItem("userName") ?? "No username input";
}

class MyList {
    constructor() {
        let storedPersonalLists = JSON.parse(localStorage.getItem('myLists')) || [];
        // Ensure each list has a 'completedItems' array
        this.lists = storedPersonalLists.map(list => ({
            ...list,
            myCompletedItems: list.myCompletedItems || []
        }));
    }
    
    createList(listName) {
        fetch('/api/myLists', {
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
        fetch(`/api/myLists/${listId}/items`, {
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
    
    markItemAsCompleted(listId, itemId) {
        fetch(`/api/myLists/${listId}/completeItem/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => this.fetchAndRenderLists()) // Assuming you create a new method to fetch lists and render
        .catch(error => console.error('Error completing item:', error));
    }
    
    returnCompletedItemToMainList(listId, itemId) {
        fetch(`/api/myLists/${listId}/reactivateItem/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => this.fetchAndRenderLists()) // Assuming you create a new method to fetch lists and render
        .catch(error => console.error('Error reactivating item:', error));
    }
    
    fetchAndRenderLists() {
        fetch('/api/myLists')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            this.lists = data;
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
    }

    renderLists() {
        const mainElement = document.querySelector('main');
        mainElement.querySelectorAll('.list-container').forEach(container => container.remove());
    
        this.lists.forEach(list => {
            const items = list.items || []; // Updated to match the server's response
            const myCompletedItems = list.myCompletedItems || [];
    
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
                    <ul class="list active-items">
                        ${items.map(item => `<li class="active-item" data-item-id="${item.id}">${item.name}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3>Completed Items</h3>
                    <ul class="list completed-items">
                    ${myCompletedItems.map(item => `<li class="completed-item" data-item-id="${item.id}">${item.name}</li>`).join('')}
                    </ul>
                </div>
            `;
            mainElement.appendChild(listContainer);
            this.setupEventListeners(listContainer, list.id);
        });
    }        
}

const myList = new MyList();
myList.fetchAndRenderLists(); // Initial render

document.getElementById('createMyListButton').addEventListener('click', () => {
    const myListNameInput = document.getElementById('myListName');
    const myListName = myListNameInput.value.trim();
    if (myListName) {
        myList.createList(myListName);
        myListNameInput.value = ''; // Clear input after creating
    } else {
        alert('Please enter a list name.');
    }
});
