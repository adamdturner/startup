
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
        // Check if the list already exists
        const listExists = this.lists.some(list => list.name === listName);
        if (!listExists) {
            const newList = { name: listName, myItems: [], myCompletedItems: [] };
            this.lists.push(newList);
            this.updateLocalStorage();
            this.renderLists();
        } else {
            alert("A list with this name already exists.");
        }
    }        

    addItemToList(listName, itemName, itemNameInput) { // Assuming itemNameInput is the input element, if not, you'll need to retrieve it inside this method.
        // Trim the itemName to remove leading and trailing whitespace
        itemName = itemName.trim();
        const list = this.lists.find(list => list.name === listName);
        if (list) {
            if (itemName.length > 0) {
                const itemExists = list.myItems.includes(itemName) || list.myCompletedItems.includes(itemName);
                if (!itemExists) {
                    list.myItems.push(itemName);
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
    

    markItemAsCompleted(listName, itemName) {
        const list = this.lists.find(list => list.name === listName);
        if (list) {
            // Move item to completedItems
            list.myItems = list.myItems.filter(item => item !== itemName);
            list.myCompletedItems.push(itemName);
            
            this.updateLocalStorage();
            this.renderLists();
        }
    }    

    updateLocalStorage() {
        localStorage.setItem('myLists', JSON.stringify(this.lists));
    }

    renderLists() {
        const mainElement = document.querySelector('main');
        // Clear current lists to re-render
        mainElement.querySelectorAll('.list-container').forEach(container => container.remove());

        this.lists.forEach(list => {
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
                        ${list.myItems.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3>Completed Items</h3>
                    <ul class="list">
                        ${list.myCompletedItems.map(item => `<li>${item}</li>`).join('')}
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
            listContainer.querySelectorAll('.list li').forEach(itemElement => {
                itemElement.addEventListener('click', () => {
                    const itemName = itemElement.textContent;
                    this.markItemAsCompleted(list.name, itemName);
                });
            });
        });
    }
}

const myList = new MyList();
myList.renderLists(); // Initial render

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
