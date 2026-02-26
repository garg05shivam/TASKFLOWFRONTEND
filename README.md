# TaskFlow Frontend

React + Vite frontend for TaskFlow. Provides role-based dashboards (`user`, `admin`, `super_admin`), project/task workflows, collaboration UI, notifications, analytics, and kanban/list task views.

## Overview
| Item | Details |
|---|---|
| Framework | React (Vite) |
| Routing | React Router DOM |
| API Client | Axios |
| Notifications | react-hot-toast |
| Styling | Custom CSS |
| Target Users | User, Admin, Super Admin |

## UI Feature Matrix
| Area | Features |
|---|---|
| Authentication | Login, Register, OTP verification |
| Dashboard | Role-scoped project/task display, analytics cards |
| Task Views | List + Kanban toggle |
| Task Metadata | Status, priority, labels, due date, assignee |
| Collaboration | Team invites, project chat, task comments, activity log |
| Notifications | Notification list, unread indicator, mark read, clear all |
| Assignment Flow | Admin assigns tasks, users see assigned work |
| Completion Flow | Assigned user can complete task and trigger admin notification |
| Super Admin Panel | Global overview + user controls (promote/demote, activate/deactivate, remove) |

## Role Experience
| Role | Dashboard Behavior |
|---|---|
| `user` | Assigned-task-focused data and collaboration access |
| `admin` | Project/task/team management in owned scope |
| `super_admin` | Global monitoring and governance tools |

## Tech Stack
| Layer | Technology |
|---|---|
| UI Library | React 19 |
| Build Tool | Vite |
| Routing | react-router-dom |
| HTTP | Axios |
| Toasts | react-hot-toast |
| Styling | CSS modules/pages (custom) |

## Project Structure
```text
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

## Main Routes
| Route | Purpose |
|---|---|
| `/` | Login page |
| `/register` | Register page |
| `/verify-otp` | OTP verification page |
| `/dashboard` | Main dashboard |
| `/projects/new` | Create project |
| `/projects/:id` | Project details |
| `/projects/:id/tasks/new` | Create task |
| `/tasks/:id/edit` | Edit task |
| `/profile` | User profile |
| `/notifications` | Notifications page |
| `/invite/accept` | Invitation acceptance flow |

## Environment Variables
| Variable | Required | Example | Notes |
|---|---|---|---|
| `VITE_API_URL` | No (recommended) | `http://localhost:5000/api` | Backend API base URL |

Default fallback if unset:
- `http://localhost:5000/api`

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` in `taskflow-frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Run development server:
```bash
npm run dev
```

4. Production build:
```bash
npm run build
npm run preview
```

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Create production build |
| `npm run lint` | Run lint checks |
| `npm run preview` | Preview production build locally |

## Frontend Behavior Notes
- JWT is stored in local storage and attached via Axios interceptor.
- On unauthorized (`401`) responses, app logs out and redirects to login.
- UI renders super admin controls only when role is `super_admin`.
- User dashboard analytics should remain scoped to that user’s assigned tasks.

## Demo Checklist
1. Login as admin and create at least one project.
2. Invite user, accept invite from user account.
3. Create and assign task to invited user.
4. Verify user sees assigned task and notifications.
5. Verify list/kanban switch and filters (status/priority/label).
6. Verify super admin actions in admin panel.
