# Task Management Application

## Features

-  **Create Tasks** - Add new tasks with title and description
-  **Edit Tasks** - Update tasks in a modal dialog to prevent multiple simultaneous edits
-  **Delete Tasks** - Remove tasks with a customized confirmation dialog
-  **Mark Completion** - Toggle tasks between active and completed status
-  **Search** - Find tasks by keywords
-  **Filter** - View tasks by status (all, active, completed)


## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Lightning-fast build tool
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MariaDB** - Relational database
- **MySQL2** - MySQL client for Node.js


## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v7 or higher) - Comes with Node.js
- **XAMPP** (with Apache, MySQL/MariaDB, phpMyAdmin) - [Download](https://www.apachefriends.org/)
- **Git** - [Download](https://git-scm.com/)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <https://github.com/Lynlcrz/Task-Management-Application.git>
cd task-management-application
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create a .env file in the backend directory

# Start XAMPP (if not already running)
# Windows: Run XAMPP Control Panel and click Start for Apache and MySQL

# Create the database:
# 1. Open phpMyAdmin: http://localhost/phpmyadmin
# 2. Create a new database named "task_management"
# 3. Or run the provided database initialization script

# Start the backend server
npm run dev
# or
npm start
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the next available port)

## How to Run the Application

### Running Both Frontend and Backend

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Click "Start" for both Apache and MySQL
   - Verify services are running

2. **Create Database**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create a new database named `task_management`
   - Ensure database user credentials match `.env` (default: root with no password)

3. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```

4. **Start Frontend Dev Server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)
   - Start managing your tasks!
