# startup

Here are the notes I will be taking for this class in the [notes.md](https://github.com/adamdturner/startup/blob/688eea9d56f049f68e8a7ad01f3f23ac15ce6375/notes.md) file.

## Deliverables:
In this section I will write notes for each deliverable to show the graders what I have been working on and changing during each step.

### 1. Specification Deliverable
Elevator Pitch:
It is the number 1 task manager for groups or individuals. Task manager is a simple tool for for managing daily tasks or projects. Users can create accounts, add tasks, set deadlines, and mark tasks as complete. Users will also have the option to create group task lists where anyone in the group is capable of adding tasks or checking them off; when a task is completed by someone in the group, everyone else is notified. The user who creates the list is considered the list admin and they are the only one capable of adding new people to the group. It is great for a family who needs to get a list of chores done around the house or a study group splitting up the homework. It could even be used as a packing list for a group camping trip to make sure all of the supplies are brought.

## Design:



## Key Features and technologies:

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


### 2. HTML

### 3. CSS

### 4. JavaScript

### 5. Web service

### 6. Login

### 7. WebSocket

### 8. React

