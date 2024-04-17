import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import '../app.css';

export function Authenticated(props) {
  const navigate = useNavigate();

  function logout() {
    fetch(`/api/auth/logout`, {
      method: 'delete',
    })
      .catch(() => {
        // Logout failed. Assuming offline
      })
      .finally(() => {
        localStorage.removeItem('userName');
        props.onLogout();
      });
  }

  return (
    <div>
      <p>Access your personal and group task lists</p>
      <div className='playerName'>{props.userName}</div>
      <Button variant='secondary' onClick={() => navigate('/myLists')}>My Lists</Button>
      <Button variant='secondary' onClick={() => navigate('/groupLists')}>Group Lists</Button>
      <Button variant='primary' onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}
