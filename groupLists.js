
function displayUserName() {
  var text = getUserName();
  document.getElementById('userName_placeHolder').innerText = text;
}
  
function getUserName() {
  if (localStorage.getItem("userName") === "") return "No username input";
  else return localStorage.getItem("userName") ?? "No username input";
}

