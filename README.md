# TaskFlow Frontend

React + Vite frontend for TaskFlow with role-based dashboards, collaboration UI, notifications, and analytics charts.

## Core Features
- Authentication UI: login, register, OTP verify
- Role-based dashboards:
  - `user`: assigned-task focused view
  - `admin`: project/task/team management
  - `super_admin`: global overview + user controls
- Project and task management flows
- Kanban task view
- Priority + labels with filters
- Collaboration UI: comments, chat, activity log
- Notifications page: unread count, mark-read, clear-all
- Super admin actions in dashboard:
  - promote/demote user/admin
  - activate/deactivate user
  - remove user/admin
- Chart sections (status, priority, 7-day completion trend)

## Tech Stack
- React 19
- Vite
- React Router DOM
- Axios
- react-hot-toast
- Plain CSS (custom theme)

## Folder Structure
```
taskflow-frontend/
  src/
    api/
    components/
    context/
    pages/
    routes/
    App.jsx
    main.jsx
  package.json
  vite.config.js
```

## Setup
1. Install:
```bash
npm install
```

2. Configure API base URL in `src/api/axios.js` (if needed)

3. Run:
```bash
npm run dev
```

4. Production build:
```bash
npm run build
npm run preview
```

## Routes
- `/` login
- `/register`
- `/verify-otp`
- `/dashboard`
- `/projects/new`
- `/projects/:id`
- `/projects/:id/tasks/new`
- `/tasks/:id/edit`
- `/profile`
- `/notifications`
- `/invite/accept`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Notes
- Dashboard behavior changes by logged-in role.
- Super admin UI appears only for accounts with `role = super_admin` in JWT payload.
