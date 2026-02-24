# Coaching App

A full-stack fitness coaching application where coaches can create workouts and track client progress, and clients can log workouts and track macros.

## Features

- **User Authentication**: Register and login with role-based access (Coach/Client)
- **Workout Management**: 
  - Coaches can create workouts with exercises for clients
  - Clients can view and log workout completion
- **Macro Tracking**: 
  - Clients can log daily meals with protein, carbs, fats, and calories
  - Visual progress tracking with daily targets

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- Vite for build tooling

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/coaching-app
JWT_SECRET=your-secret-key-change-this-in-production
```

4. Make sure MongoDB is running on your system

5. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

## Usage

1. **Register**: Create an account as either a Coach or Client
2. **Login**: Sign in with your credentials
3. **Coaches**: 
   - Create workouts for clients (you'll need the client's user ID)
   - View client information
4. **Clients**:
   - View assigned workouts
   - Log workout completion
   - Track daily macros and meals

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login
- `GET /api/users/me` - Get current user (protected)

### Workouts
- `POST /api/workouts` - Create a workout (Coach only)
- `GET /api/workouts/client/:clientId` - Get workouts for a client
- `GET /api/workouts/:id` - Get a single workout
- `PUT /api/workouts/:id` - Update workout (log completion)
- `DELETE /api/workouts/:id` - Delete a workout

### Macros
- `POST /api/macros` - Create or update macro entry
- `GET /api/macros/:clientId/:date` - Get macro entry for a date
- `DELETE /api/macros/:id/meal/:mealIndex` - Delete a meal

## Project Structure

```
coaching-app/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Workout.js
│   │   └── Macro.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── workoutRoutes.js
│   │   └── macroRoutes.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Notes

- Make sure MongoDB is installed and running before starting the backend
- The JWT_SECRET should be changed to a secure random string in production
- Client IDs can be found in the user's profile after registration
- All API endpoints (except register/login) require authentication via JWT token

