# EquiSchedule Backend

EquiSchedule is a Node.js, Express, and MongoDB backend for a mobile horse management and scheduling app. It supports owners, trainers, and students with role-based access to horses, private horse-care records, expenses, lessons, and show schedules.

## Features

- JWT authentication with `owner`, `trainer`, and `student` roles
- Owner-only horse, event, and expense management
- Trainer/student lesson and show scheduling APIs
- Monthly and yearly expense summaries grouped by horse
- Show day planner timeline fields calculated automatically from the entered schedule inputs

## Tech Stack

- Node.js
- Express
- MongoDB Atlas with Mongoose
- JWT Authentication
- bcryptjs
- dotenv
- cors

## Project Structure

```text
equischedule-backend/
├── config/
│   └── db.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/
│   ├── Event.js
│   ├── Expense.js
│   ├── Horse.js
│   ├── Lesson.js
│   ├── ShowSchedule.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── expenseRoutes.js
│   ├── horseRoutes.js
│   ├── lessonRoutes.js
│   └── showRoutes.js
├── .env
├── server.js
└── package.json
```

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root with:

```env
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_DB_NAME=equischedule
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
```

You can copy `.env.example` and fill in your real values.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Add a database user with read/write access.
3. Add your local IP address to the Atlas network access list.
4. Copy the Atlas connection string and place it in `MONGODB_URI`.
5. Set `MONGODB_DB_NAME` to your preferred database name.

## Running the Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## Deploying to Render

This repo includes [render.yaml](/Users/christinecai/Desktop/Software%20Engineering%20Bootcamp/Capstone%20Project/capstone-backend/render.yaml:1), so you can deploy it as a Blueprint or copy the same values into a manual Web Service.

### Manual Render setup

1. Create a new `Web Service`.
2. Connect this GitHub repo.
3. Use:
   - Build command: `npm install`
   - Start command: `npm start`
   - Runtime: `Node`
4. Add these environment variables in Render:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME=equischedule`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `NODE_VERSION=20`
5. Deploy and open the service URL.

### Atlas requirements for Render

- Use a real MongoDB Atlas connection string in `MONGODB_URI`.
- Make sure your Atlas database user has read/write access.
- In Atlas `Network Access`, allow Render to connect.
  For testing, `0.0.0.0/0` is the simplest option.

Root route:

```http
GET /
```

Response:

```json
{
  "message": "EquiSchedule API is running"
}
```

## Authentication

### Register

```http
POST /api/auth/register
```

Request body:

```json
{
  "name": "Jane Rider",
  "email": "jane@example.com",
  "password": "password123",
  "role": "owner"
}
```

### Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

Protected routes require:

```http
Authorization: Bearer <jwt-token>
```

## API Routes

### Horses

- `GET /api/horses`
- `POST /api/horses`
- `PUT /api/horses/:id`
- `DELETE /api/horses/:id`

Owners can only manage their own horses.

### Owner Events

- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

These routes are private to the owner.

### Expenses

- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `GET /api/expenses/monthly`
- `GET /api/expenses/yearly`

Summary endpoints return totals grouped by horse. Optional query params:

- `month`: `1-12` for the monthly summary
- `year`: four-digit year for monthly or yearly summary

### Lessons

- `GET /api/lessons`
- `POST /api/lessons`
- `PUT /api/lessons/:id`
- `DELETE /api/lessons/:id`

Trainers can create, view, update, and delete their lessons. Students can view and update lessons assigned to them.

### Shows

- `GET /api/shows`
- `POST /api/shows`
- `PUT /api/shows/:id`
- `DELETE /api/shows/:id`

Trainers can create, view, update, and delete their show schedules. Students can view and update show schedules assigned to them.

## Show Day Planner

When a show schedule is created or updated, the backend calculates:

- `leaveBarnTime`
- `arrivalTime`
- `tackUpStartTime`
- `warmupStartTime`

Required planner inputs:

- `showTime`
- `driveTimeMinutes`
- `tackUpMinutes`
- `warmupMinutes`
- `bufferMinutes`

## Authorization Rules

- Owners manage only their own horses, events, and expenses.
- Trainers manage lessons and show schedules they own.
- Students can view and update lessons and show schedules assigned to them.
- Trainers and students cannot access owner-only expenses or private horse-care events.
