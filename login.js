function login() {
    const nameElement = document.querySelector("#name");
    localStorage.setItem("userName", nameElement.value);
    window.location.href = "myLists.html";
  }