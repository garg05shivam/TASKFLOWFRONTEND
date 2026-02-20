# TaskFlow Frontend

A modern React-based frontend for task and project management application.

## Features

- **User Authentication**: Login, Register, OTP verification
- **Dashboard**: View all projects and tasks at a glance
- **Project Management**: Create, view, and manage projects
- **Task Management**: Create, edit, and delete tasks within projects
- **Protected Routes**: Secure access to authenticated pages
- **Responsive Design**: Works on desktop and mobile devices
- **Toast Notifications**: User feedback with react-hot-toast

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios
- **Styling**: CSS
- **Notifications**: react-hot-toast

## Project Structure

```
taskflow-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/
│   │   └── axios.js          # Axios configuration
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── ProjectForm.jsx  # Project creation form
│   │   ├── ProjectList.jsx  # Project list display
│   │   ├── TaskForm.jsx     # Task creation form
│   │   └── TaskList.jsx     # Task list display
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── hooks/
│   ├── pages/
│   │   ├── Auth.css         # Authentication styles
│   │   ├── Dashboard.css    # Dashboard styles
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   └── VerifyOtp.jsx    # OTP verification page
│   ├── routes/
│   │   └── ProtectedRoute.jsx # Protected route wrapper
│   ├── utils/
│   ├── App.css
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   
```
bash
   cd taskflow-frontend
   
```

2. Install dependencies:
   
```
bash
   npm install
   
```

3. Start the development server:
   
```
bash
   npm run dev
   
```

4. Open your browser and visit:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## Configuration

The frontend connects to the backend API. Make sure the backend is running and update the API base URL in `src/api/axios.js` if needed.

```
javascript
// src/api/axios.js
const API_BASE_URL = 'http://localhost:5000/api';
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Pages

### Login
- User login with email and password
- Link to registration page

### Register
- New user registration
- Email, password, and confirm password

### Verify OTP
- OTP verification after registration
- Resend OTP option

### Dashboard
- View all projects
- View all tasks
- Create new projects and tasks
- Edit and delete functionality

## Authentication Flow

1. User registers with email and password
2. OTP is sent to the user's email
3. User verifies OTP
4. User can now login
5. JWT token is stored for authentication
6. Protected routes require valid token

## API Integration

The frontend uses Axios for HTTP requests. All API calls are configured in `src/api/axios.js` with:

- Base URL configuration
- Request interceptors for auth tokens
- Response interceptors for error handling

## License

ISC
