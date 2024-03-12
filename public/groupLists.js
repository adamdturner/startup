
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
        let storedLists = JSON.parse(localStorage.getItem('groupLists')) || [];
        // Ensure each list has a 'completedItems' array
        this.groupLists = storedLists.map(list => ({
            ...list,
            listContributors: list.listContributors || [],
            groupCompletedItems: list.groupCompletedItems || []
        }));
    }

    createList(listName) {
        // Check if the list already exists
        const listExists = this.groupLists.some(list => list.name === listName);
        if (!listExists) {
            const newList = { name: listName, groupItems: [], groupCompletedItems: [], listContributors: [] };
            var admin = getUserName() + " (Admin)";
            newList.listContributors.push(admin);
            this.groupLists.push(newList);
            this.updateLocalStorage();
            this.renderLists();
        } else {
            alert("A list with this name already exists.");
        }
    }

    addItemToList(listName, itemName, itemNameInput) { // Assuming itemNameInput is the input element, if not, you'll need to retrieve it inside this method.
        // Trim the itemName to remove leading and trailing whitespace
        itemName = itemName.trim();
        const list = this.groupLists.find(list => list.name === listName);
        if (list) {
            if (itemName.length > 0) {
                const itemExists = list.groupItems.includes(itemName) || list.groupCompletedItems.includes(itemName);
                if (!itemExists) {
                    list.groupItems.push(itemName);
                    this.updateLocalStorage();
                    this.renderLists();
                } else {
                    alert("This item already exists in the list.");
                }
            } else {
                alert("Item name cannot be empty.");
            }
        }
        // Clear the input field and set focus back to it
        if (itemNameInput) {
            itemNameInput.value = ''; // Clear input after adding or if the attempt was to add an empty item
            itemNameInput.focus(); // Bring focus back to the input field for better user experience
        }
    }

    addContributor(listName, userName, userNameInput) {
        // Trim the itemName to remove leading and trailing whitespace
        userName = userName.trim();
        const list = this.groupLists.find(list => list.name === listName);
        if (list) {
            if (userName.length > 0) {
                const userExists = list.listContributors.includes(userName);
                if (!userExists) {
                    list.listContributors.push(userName);
                    this.updateLocalStorage();
                    this.renderLists();
                } else {
                    alert("This username already exists in the list.");
                }
            } else {
                alert("Username cannot be empty.");
            }
        }
        // Clear the input field and set focus back to it
        if (userNameInput) {
            userNameInput.value = ''; // Clear input after adding or if the attempt was to add an empty item
            userNameInput.focus(); // Bring focus back to the input field for better user experience
        }
    }

    markItemAsCompleted(listName, itemName) {
        const list = this.groupLists.find(list => list.name === listName);
        if (list) {
            // Move item to completedItems
            list.groupItems = list.groupItems.filter(item => item !== itemName);
            list.groupCompletedItems.push(itemName);
            
            this.updateLocalStorage();
            this.renderLists();
        }
    }

    returnCompletedItemToMainList(listName, itemName) {
        const list = this.groupLists.find(list => list.name === listName);
        if (list) {
            // Remove item from completedItems and add it back to items
            list.groupCompletedItems = list.groupCompletedItems.filter(item => item !== itemName);
            list.groupItems.push(itemName);
    
            this.updateLocalStorage();
            this.renderLists();
        }
    }

    updateLocalStorage() {
        localStorage.setItem('groupLists', JSON.stringify(this.groupLists));
    }

    renderLists() {
        const mainElement = document.querySelector('main');
        // Clear current lists to re-render
        mainElement.querySelectorAll('.list-container').forEach(container => container.remove());

        this.groupLists.forEach(list => {
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
                        ${list.groupItems.map(item => `<li class="active-item">${item}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3>Completed Items</h3>
                    <ul class="list">
                        ${list.groupCompletedItems.map(item => `<li class="completed-item">${item}</li>`).join('')}
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
                        ${list.listContributors.map(item => `<li class="contributor">${item}</li>`).join('')}
                    </ul>
                </div>
            `;
            mainElement.appendChild(listContainer);

            // Add item functionality
            listContainer.querySelector('.addItemButton').addEventListener('click', () => {
                const itemNameInput = listContainer.querySelector('.itemName');
                this.addItemToList(list.name, itemNameInput.value, itemNameInput); // Pass the input element as well
                itemNameInput.value = ''; // Clear input after adding
            });

            // Move to completed functionality
            listContainer.querySelectorAll('.active-item').forEach(itemElement => {
                itemElement.addEventListener('click', () => {
                    const itemName = itemElement.textContent;
                    this.markItemAsCompleted(list.name, itemName);
                });
            });

            // Return item to main list functionality
            listContainer.querySelectorAll('.completed-item').forEach(itemElement => {
                itemElement.addEventListener('click', () => {
                    const itemName = itemElement.textContent;
                    this.returnCompletedItemToMainList(list.name, itemName);
                });
            });

            // Add contributor functionality
            listContainer.querySelector('.addContributorButton').addEventListener('click', () => {
                const userNameInput = listContainer.querySelector('.userName');
                this.addContributor(list.name, userNameInput.value, userNameInput);
                userNameInput.value = '';
            })

        });
    }
}

const groupList = new GroupList();
groupList.renderLists(); // Initial render

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
