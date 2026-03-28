# Quick Start Guide for ChatBox React Edition

## 📦 Prerequisites

- Node.js (v14+)
- npm (v6+)

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd ../frontend
npm install
```

### Step 2: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
✓ Server running on http://localhost:5000
✓ Socket.IO listening on http://localhost:5000
```

### Step 3: Start Frontend (in new terminal)

```bash
cd frontend
npm start
```

The app will automatically open at **http://localhost:3000**

## 🎯 Test the Application

### Option A: Same Computer (2 Browser Tabs)

1. **Tab 1** (http://localhost:3000):
   - Click "Register"
   - Create User A (username: `a`, password: `password`)
   - Click "Login"

2. **Tab 2** (http://localhost:3000):
   - Create User B (username: `b`, password: `password`)
   - Click "Login"

3. **Tab 1** (User A):
   - Click on user "b" from the users list
   - Type message and click "Send"

4. **Tab 2** (User B):
   - See the message appear instantly!
   - Type reply and send

### Option B: Two Different Computers

1. Update `frontend/src/components/Dashboard.js`:
   ```javascript
   const newSocket = io('http://YOUR_SERVER_IP:5000');
   ```
   And `frontend/src/components/Auth.js`:
   ```javascript
   await axios.post('http://YOUR_SERVER_IP:5000/api/login', ...);
   ```

2. Same testing steps as Option A

## ⚙️ Configuration

### Backend Port
Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5000;  // Change 5000 to your port
```

### Frontend Port
Edit `frontend/package.json`:
```json
"proxy": "http://localhost:5000"  // Change if backend port changed
```

Also update component files to use correct backend URL.

### JWT Secret
Edit `backend/.env`:
```
JWT_SECRET=your-custom-secret-key
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules
npm install
npm start
```

### Frontend won't start
```bash
# Same as backend
cd frontend
rm -rf node_modules
npm install
npm start
```

### "Cannot connect to backend"
- Ensure backend is running on port 5000
- Check firewall settings
- Verify backend console shows "Server running"

### Database not found
- Backend will auto-create `chatbox.db` on first run
- If corrupted, delete it: `rm backend/chatbox.db`

### No real-time messages
- Ensure Socket.IO connection is working
- Check browser console for connection errors  
- Verify both frontend and backend are running

## 📚 Project Structure

```
chatbox-react/
├── backend/                 # Express + Socket.IO server
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── .env                # Environment variables
│   └── chatbox.db          # SQLite database
│
└── frontend/               # React application
    ├── public/
    │   └── index.html      # HTML entry point
    ├── src/
    │   ├── components/     # React components
    │   │   ├── Auth.js     # Login/Register
    │   │   ├── Auth.css
    │   │   ├── Dashboard.js # Chat interface
    │   │   └── Dashboard.css
    │   ├── App.js          # Main App
    │   ├── App.css
    │   ├── index.js        # Entry point
    │   └── index.css
    └── package.json        # Dependencies
```

## 🔐 Security Notes

⚠️ **For Development Only!**

For production:
- Change `JWT_SECRET` to a strong random key
- Use HTTPS instead of HTTP
- Add input validation
- Implement rate limiting
- Use environment-specific configs
- Add password strength requirements
- Implement refresh tokens

## 📱 Features

- ✅ User Registration & Login
- ✅ Real-time Messaging (Socket.IO)
- ✅ User List
- ✅ Message History
- ✅ Auto-refresh
- ✅ Responsive Design
- ✅ Session Management
- ✅ JWT Authentication

## 📞 Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Clean up
rm -rf node_modules
```

## 🎓 Next Steps

1. ✅ Get app running (this guide)
2. 🔄 Test with multiple users
3. 🎨 Customize styling
4. ➕ Add new features
5. 🚀 Deploy to production

## 📖 Read More

- See `README.md` for full documentation
- Check backend `server.js` for API endpoints
- Review React components for UI code

Enjoy your React ChatBox! 🎉
