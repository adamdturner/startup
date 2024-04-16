import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <body>
      <header>
        <nav className='navbar'>
          <a className='navbar-brand'>Task Manager<sup>&reg;</sup></a>
            <ul className='navbar-nav'>

              <li className='nav-item'>
                <a className='nav-link' href='index.html'>Home</a>
              </li>

              <li className='nav-item'>
                <a className='nav-link' href='about.html'>About</a>
              </li>

              <li className='nav-item'>
                <a className='nav-link' href='myLists.html'>myLists</a>
              </li>

              <li className='nav-item'>
                <a className='nav-link' href='groupLists.html'>groupLists</a>
              </li>

            </ul>
        </nav>
      </header>

      <main>App components go here</main>

      <footer>
        <hr />
        <span className='text-reset'>Author: Adam Turner</span>
        <br />
        <a href='https://github.com/webprogramming260/simon-react'>GitHub</a>
      </footer>
      
    </body>
  );
}


