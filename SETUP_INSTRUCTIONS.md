# Setup Instructions

## Step 1: Backend Setup

### 1.1 Create Backend .env File

Navigate to the `backend` folder and create a file named `.env` with the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/coaching-app
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
```

**Important Notes:**
- **MONGO_URI**: 
  - If you have MongoDB installed locally, use: `mongodb://localhost:27017/coaching-app`
  - If using MongoDB Atlas (cloud), use: `mongodb+srv://username:password@cluster.mongodb.net/coaching-app`
  - If MongoDB runs on a different port, adjust accordingly (default is 27017)
  
- **JWT_SECRET**: 
  - Change this to a random string (e.g., use a password generator)
  - Example: `JWT_SECRET=mySecretKey123!@#xyz789`
  
- **PORT**: 
  - Default is 5000, change if needed

### 1.2 Install Backend Dependencies

Open a terminal in the `backend` folder and run:

```bash
npm install
```

### 1.3 Make Sure MongoDB is Running

**If using local MongoDB:**
- Make sure MongoDB is installed and running on your system
- On Windows: Check if MongoDB service is running in Services
- On Mac/Linux: Run `mongod` or `brew services start mongodb-community`

**If using MongoDB Atlas:**
- Make sure your connection string is correct in the .env file
- Ensure your IP is whitelisted in Atlas

### 1.4 Start the Backend Server

```bash
npm start
```

You should see:
```
MongoDB connected
Server running on port 5000
```

Keep this terminal window open!

---

## Step 2: Frontend Setup

### 2.1 Create Frontend .env File (Optional)

Navigate to the `frontend` folder and create a file named `.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note:** This is optional - if you don't create this file, it will default to `http://localhost:5000/api`

### 2.2 Install Frontend Dependencies

Open a **new** terminal window, navigate to the `frontend` folder and run:

```bash
npm install
```

### 2.3 Start the Frontend Development Server

```bash
npm run dev
```

You should see something like:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 3: Access the Application

1. Open your browser and go to: **http://localhost:5173**
2. You should see the login page
3. Click "Register" to create an account
4. Choose your role (Coach or Client)
5. Start using the app!

---

## Quick Start Commands Summary

### Terminal 1 (Backend):
```bash
cd backend
npm install
# Create .env file (see above)
npm start
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm install
# Create .env file (optional)
npm run dev
```

---

## Troubleshooting

### Backend won't start:
- **MongoDB connection error**: Make sure MongoDB is running
- **Port already in use**: Change PORT in .env to a different number (e.g., 5001)
- **Missing .env file**: Make sure .env is in the `backend` folder (not root)

### Frontend won't connect to backend:
- Make sure backend is running on port 5000
- Check that VITE_API_URL in frontend/.env matches your backend URL
- Check browser console for CORS errors

### Can't register/login:
- Make sure backend is running
- Check browser console for errors
- Verify JWT_SECRET is set in backend/.env

---

## Example .env Files

### backend/.env
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/coaching-app
JWT_SECRET=mySecretKey123!@#xyz789abcdef
```

### frontend/.env (optional)
```env
VITE_API_URL=http://localhost:5000/api
```

