
  
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
        this.lists = JSON.parse(localStorage.getItem('lists')) || [];
    }

    createList(listName) {
        const newList = { name: listName, items: [] };
        this.lists.push(newList);
        this.updateLocalStorage();
        this.renderLists();
    }

    addItemToList(listName, itemName) {
        const list = this.lists.find(list => list.name === listName);
        if (list) {
            list.items.push(itemName);
            this.updateLocalStorage();
            this.renderLists();
        }
    }

    updateLocalStorage() {
        localStorage.setItem('lists', JSON.stringify(this.lists));
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
                        ${list.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
            mainElement.appendChild(listContainer);

            listContainer.querySelector('.addItemButton').addEventListener('click', () => {
                const itemNameInput = listContainer.querySelector('.itemName');
                this.addItemToList(list.name, itemNameInput.value);
                itemNameInput.value = ''; // Clear input after adding
            });
        });
    }
}

const myList = new MyList();
myList.renderLists(); // Initial render

document.getElementById('createListButton').addEventListener('click', () => {
    const listNameInput = document.getElementById('listName');
    const listName = listNameInput.value.trim();
    if (listName) {
        myList.createList(listName);
        listNameInput.value = ''; // Clear input after creating
    } else {
        alert('Please enter a list name.');
    }
});
