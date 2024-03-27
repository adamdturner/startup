(async () => {
  const userName = localStorage.getItem('userName');
  if (userName) {
    document.querySelector('#user').textContent = userName;
    setDisplay('LoggedOut', 'none');
    setDisplay('LoggedIn', 'block');
  } else {
    setDisplay('LoggedOut', 'block');
    setDisplay('LoggedIn', 'none');
  }
})();

async function loginUser() {
  loginOrCreate(`/api/auth/login`);
}

async function createUser() {
  loginOrCreate(`/api/auth/create`);
}

async function loginOrCreate(endpoint) {
  const userName = document.querySelector('#userName')?.value;
  const password = document.querySelector('#userPassword')?.value;
  const response = await fetch(endpoint, {
    method: 'post',
    body: JSON.stringify({ userName: userName, password: password }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });

  if (response.ok) {
    localStorage.setItem('userName', userName);
    window.location.href = 'index.html';
  } else {
    const body = await response.json();
    const modalEl = document.querySelector('#msgModal');
    modalEl.querySelector('.modal-body').textContent = `⚠ Error: ${body.msg}`;
    const msgModal = new bootstrap.Modal(modalEl, {});
    msgModal.show();
  }
}

function logout() {
  localStorage.removeItem('userName');
  fetch(`/api/auth/logout`, {
    method: 'delete',
  }).then(() => (window.location.href = '/'));
}

function showMyLists() {
  window.location.href = 'myLists.html';
}

function showGroupLists() {
  window.location.href = 'groupLists.html';
}

function setDisplay(IDtype, display) {
  const LoggedInControlEL = document.querySelector(`#${IDtype}`);
  if (LoggedInControlEL) {
    LoggedInControlEL.style.display = display;
  }
}