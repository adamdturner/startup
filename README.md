# startup

Here are the notes I will be taking for this class in the [notes.md](notes.md) file.

### Deliverables:
In this section I will write notes for each deliverable to show the graders what I have been working on and changing during each step.

## 1. Specification Deliverable (Due January 17th)
### Elevator Pitch:

It is the number 1 task manager for groups or individuals. Task manager is a simple tool for managing daily tasks or projects. Users can create accounts, add tasks, set deadlines, and mark tasks as complete. Users will also have the option to create group task lists where anyone in the group is capable of adding tasks or checking them off; when a task is completed by someone in the group, everyone else is notified. The user who creates the list is considered the list admin and they are the only one capable of adding new people to the group. It is great for a family who needs to get a list of chores done around the house or a study group splitting up the homework. It could even be used as a packing list for a group camping trip to make sure all of the supplies are brought.

### Design:

You can see how a task list may look in the image below. When you go to one of your task lists it will open up a page like this one showing you the admin is (whether that be you or someone else if another person added you to their task group). It shows the tasks that were completed and who did them as well as the remaining tasks to complete. A full list of group members that contribute to the list are below.

![image](https://github.com/adamdturner/startup/assets/144283713/a73818ad-517d-4ef2-b094-b750bd448c04)


### Key Features and technologies:

**HTML:** (Hypertext Markup Language): HTML will be used to structure the web pages of the task manager application. This includes creating the layout for user registration and login pages, task lists, task addition, and group management interfaces.
Example: HTML forms for creating accounts, adding tasks, and input fields for setting deadlines.

**CSS:** (Cascading Style Sheets): CSS will be employed for styling and animating the application. This involves designing a visually appealing interface, ensuring responsiveness across devices, and adding animations for interactive elements like buttons or task completion.
Example: Styling the layout with colors, fonts, and spacing; animating task completion (like a strike-through effect or fade-out).

**JavaScript:** JavaScript adds interactivity to the application. It will handle user actions like clicking buttons to add tasks, marking tasks as complete, and managing group interactions.
Example: Enabling dynamic updating of the task list without needing to refresh the page, validating forms, and managing user interactions.

**Web Service:** Web services will handle remote functions. This includes APIs for user authentication, task management, and group interactions. These services can be hosted on your server.
Example: APIs for creating an account, adding tasks to the database, retrieving task lists for display, and updating task statuses.

**Authentication:** Implementing a system for users to create accounts and log in. This ensures that task lists are personal and secure, and only accessible to authorized users.
Example: Login and registration forms, session management to keep users logged in, and displaying the user's name post-login.

**Database Persistence:** Storing and retrieving user data and tasks in a database. This includes user account information, individual and group tasks, deadlines, and completion status.
Example: A database table for users, another for tasks (with fields for task details, deadlines, completion status, and associated user or group ID).

**WebSocket:** WebSocket is used for real-time communication between the client and server. In task manager, it will update task statuses instantly across all connected clients.
Example: When a user marks a task as complete, other group members receive an instant update through WebSocket, without needing to refresh their page.

**Web Framework:** Using React web framework for building the user interface.


## 2. HTML Deliverable (Due February 5th)

HTML pages - I created html pages representing the home/login page, the info/about page, the My Lists page and the Group Lists page.

Organization - Each html page has a head as well as a body which contains a header, main, and footer.

Links - links are displayed in the headers to travel between pages. 

Text - textual descriptions are used on each page to understand what each page does. It is not formatted properly, normally the task lists will have incomplete items on the left with the completed items on the right (instead of below).

Service calls - Depending on the user's logged in status they can travel to personal or group lists or they will be rerouted back to the main login page. The functionality for this is not implemented until I actually implement the services later on. Same thing goes for creating a list or marking off a list item; the functionality is not yet complete for those service calls.

Application images - the about page has an image showing an example of what the user could see if they chose to use the Task Manager.

Login - placeholder, including user name display. I also included a logout button on the other pages once the user has already logged in.

Database - lists are displayed as placeholders for what will be actual data pulled from the database in the future.  

WebSocket - completed task items are represented by placeholders as well. On group lists, these completed tasks will show up for all users, also identifying who completed the task.

## 3. CSS Deliverable (Due February 14th)

Simon.css - I deployed the Simon.css application to my projects simon subdomain here: [Simon](https://simon.adam260startup.click/)

Main.css - I included a CSS file in my startup application that has my name and link to my GitHub repository. [Startup Home Page](https://startup.adam260startup.click/)

CSS Header, Footer, Main - 

Navigation Elements - 

Window Resizing - 

Application Elements - 

Application Text Content - 

Application Images - 

## 4. JavaScript

## 5. Web service

## 6. Login

## 7. WebSocket

## 8. React

