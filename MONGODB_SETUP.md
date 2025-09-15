# MongoDB Compass Setup Guide

## Prerequisites
1. Install MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB Compass from: https://www.mongodb.com/try/download/compass

## Setup Steps

### 1. Start MongoDB Service
- On Windows, MongoDB should start automatically as a service
- If not, you can start it manually or install it as a service

### 2. Create Environment File
Create a `.env` file in the server directory with the following content:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration (Local MongoDB Compass)
MONGO_URI=mongodb://localhost:27017/doctor-appointment

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Authentication (No JWT tokens required)

# Email Configuration (if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Connect with MongoDB Compass
1. Open MongoDB Compass
2. Click "New Connection"
3. Use connection string: `mongodb://localhost:27017`
4. Click "Connect"
5. Create a new database called `doctor-appointment`

### 4. Start the Server
```bash
cd server
npm install
npm start
```

The server should now connect to your local MongoDB instance instead of MongoDB Atlas.

## Troubleshooting

### If MongoDB service is not running:
1. Open Services (services.msc)
2. Find "MongoDB" service
3. Start the service if it's not running

### If you get connection errors:
1. Make sure MongoDB is running on port 27017
2. Check if the database name is correct
3. Verify that the `.env` file is in the server directory 