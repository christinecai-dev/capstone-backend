# EquiSchedule Backend

## Project Overview

EquiSchedule Backend is a Node.js and Express API for managing horse records, private care events, expenses, lessons, and show schedules. The current backend is designed around an owner-only workflow and uses MongoDB Atlas for persistence, JWT for authentication, and Passport JWT for protected routes.

## Features

- Owner account registration and login with JWT authentication
- Owner-only CRUD for horses
- Owner-only CRUD for private calendar events
- Owner-only CRUD for expenses
- Owner-only CRUD for lessons
- Owner-only CRUD for show schedules
- Show planner timeline calculation for leave-barn, arrival, tack-up, and warm-up times
- Monthly and yearly expense summaries grouped by horse
- Lookup endpoint for owner horse selection
- Mocha/Chai unit tests for show planner calculations
- Render deployment support with `render.yaml`

## Installation Instructions

1. Clone the repository:

```bash
git clone https://github.com/christinecai-dev/capstone-backend.git
cd capstone-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root or copy `.env.example`.

Example:

```env
PORT=5050
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_DB_NAME=equischedule
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
```

4. Make sure your MongoDB Atlas cluster allows access from your machine or deployment target.

5. Start the server:

```bash
npm start
```

6. Run tests:

```bash
npm test
```

## Usage

Base local URL:

```text
http://localhost:5050
```

Root route:

```http
GET /
```

Expected response:

```json
{
  "message": "EquiSchedule API is running"
}
```

Register:

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

Login:

```http
POST /api/auth/login
```

Protected routes require:

```http
Authorization: Bearer <jwt-token>
```

Main API routes:

- `GET /api/horses`
- `POST /api/horses`
- `PUT /api/horses/:id`
- `DELETE /api/horses/:id`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `GET /api/expenses/monthly`
- `GET /api/expenses/yearly`
- `GET /api/lessons`
- `POST /api/lessons`
- `PUT /api/lessons/:id`
- `DELETE /api/lessons/:id`
- `GET /api/shows`
- `POST /api/shows`
- `PUT /api/shows/:id`
- `DELETE /api/shows/:id`
- `GET /api/lookups/horses`

Render deployment:

- Build command: `npm install`
- Start command: `npm start`
- Runtime: `Node`

## Technologies Used

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Passport JWT
- JSON Web Tokens (`jsonwebtoken`)
- bcryptjs
- dotenv
- cors
- Mocha
- Chai
- Render

## Future Improvements

- Add stronger request validation with a schema validation library
- Add pagination and filtering for larger horse/event/expense datasets
- Add automated integration tests for route-level behavior
- Add audit/history tracking for record edits
- Add file upload support for horse documents and show attachments
- Add recurring care-event scheduling for farrier, vaccination, and deworming reminders
- Improve API response formatting for frontend display components
