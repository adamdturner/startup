import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { About } from './about/about.jsx';
import { MyLists } from './myLists/myLists.jsx';
import { GroupLists } from './groupLists/groupLists.jsx';
import { AuthState } from './login/authState';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);

  return (
    <BrowserRouter>
    <body>
      <header>
        <nav className='navbar'>
          <a className='navbar-brand'>Task Manager<sup>&reg;</sup></a>
            <ul className='navbar-nav'>

              <li className='nav-item'>
                <NavLink className='nav-link' to=''>Home</NavLink>
              </li>

              <li className='nav-item'>
                <NavLink className='nav-link' to='/about'>About</NavLink>
              </li>

              {authState === AuthState.Authenticated && (
              <li className='nav-item'>
                <NavLink className='nav-link' to='/myLists'>myLists</NavLink>
              </li>
              )}

              {authState === AuthState.Authenticated && (
              <li className='nav-item'>
                <NavLink className='nav-link' to='/groupLists'>groupLists</NavLink>
              </li>
              )}

            </ul>
        </nav>
      </header>

      <Routes>
        <Route
          path='/'
          element={
            <Login
              userName={userName}
              authState={authState}
              onAuthChange={(userName, authState) => {
                setAuthState(authState);
                setUserName(userName);
              }}
            />
          }
          exact
        />
        <Route path='/myLists' element={<MyLists />} />
        <Route path='/groupLists' element={<GroupLists />} />
        <Route path='/about' element={<About />} />
        <Route path='*' element={<NotFound />} />
      </Routes>

      <main>App components go here</main>

      <footer>
        <hr />
        <span className='text-reset'>Author: Adam Turner</span>
        <br />
        <a href='https://github.com/webprogramming260/simon-react'>GitHub</a>
      </footer>
      
    </body>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}

export default App;