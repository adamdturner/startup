import React from 'react';

export function About(props) {
    const [activityIdea, setActivity] = React.useState('Fetching a fun activity...');

    React.useEffect(() => {
        fetch('https://www.boredapi.com/api/activity/')
          .then((response) => response.json())
          .then((data) => {
            if (data && data.activity) {
              setActivity(data.activity); // assuming 'activity' is the field you want from the API response
            }
          })
          .catch(error => {
            console.error('Failed to fetch activity:', error);
            setActivity('Failed to fetch a fun activity.');
          });
      }, []);

    return (
        <main>
            <div id="randomActivityContainer">
                <h3>Bored and don't know what to do? Try this!</h3>
                <p id="randomActivity">{activityIdea}</p>
            </div>
            <p>
                Task Manager is a way to organize your own personal lists. This could be a to-do list, 
                a homework list or a shopping list. Anything that you need to keep track of can be organized 
                into a personal list that shows you what is complete and what is incomplete.
            </p>
        
            <p>
                You can also add other users to your list, allowing them permission to add things to the list 
                and also check things off when they are completed. Let's say you are preparing for a camping 
                trip and everyone is supposed to bring items like tents stoves etc. You can create a list of 
                items you need and each person can check off the items that they have packed. It notifies everyone 
                when someone checks off something on the list.
            </p>
            
            <h2>Image of an example Group List:</h2>
            <figure>
                <div 
                id="picture" 
                className="picture-box">
                <img src="https://github.com/adamdturner/startup/assets/144283713/a73818ad-517d-4ef2-b094-b750bd448c04" 
                alt="Example group list for camping trip"/>
                </div>
            </figure>
    
        </main>
      );
}
