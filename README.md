# ChatBox React Edition

A complete conversion of the Streamlit ChatBox app to a modern React.js + Node.js stack.

## 🏗️ Project Structure

```
chatbox-react/
├── backend/
│   ├── package.json
│   ├── server.js           # Express + Socket.IO server
│   └── chatbox.db          # SQLite database (auto-created)
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Auth.js      # Login/Register component
        │   ├── Auth.css
        │   ├── Dashboard.js # Chat interface
        │   └── Dashboard.css
        ├── App.js           # Main App component
        ├── App.css
        ├── index.js
        └── index.css
```

## 🚀 Installation & Setup

### Backend Setup

```bash
cd backend
npm install
npm start
```

Server will run on: **http://localhost:5000**
Server will run on: **http://127.0.0.1:5000**

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

App will open at: **http://127.0.0.1:3000**

## 🎯 Features

### ✅ Implemented
- 🔐 User Authentication (Register & Login)
- 💬 Real-time Messaging with Socket.IO
- 👥 User List & Selection
- 📊 Message History
- 🎨 Modern React Components
- 🔒 JWT Token Authentication
- 📱 Responsive Design
- ⚡ Auto-refresh messaging
- 🔄 Session Management

### 🗂️ Architecture

```
Frontend (React)          Backend (Node.js)        Database (SQLite)
────────────────         ──────────────────       ────────────────
├─ Auth Component        ├─ API Routes            ├─ users table
├─ Dashboard Component   ├─ Socket.IO Server      ├─ messages table
└─ State Management      └─ Database Layer        └─ chatbox.db
```

## 🔄 Data Flow

### Login Flow
```
User enters credentials → Frontend validates → API call to backend
→ Backend verifies password → JWT token created → Frontend stores token
→ Dashboard component loaded
```

### Message Flow
```
User sends message → Frontend emits Socket event
→ Backend receives message → Saved to database
→ Backend broadcasts to receiver via Socket.IO
→ Receiver gets message in real-time
```

## 📝 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Users
- `GET /api/users?exclude=userId` - Get all users

### Messages
- `GET /api/messages?userId1=X&userId2=Y` - Get messages between users
- `POST /api/messages` - Save new message

## 🔌 Socket.IO Events

### Emit (from client)
- `login` - Notify user login
- `send_message` - Send message to another user

### Listen (from server)
- `receive_message` - Receive message from another user
- `message_sent` - Confirm message was sent

## 🎨 UI Components

### Auth Component
- Login form with username & password
- Registration form with password confirmation
- Error handling and validation
- Tab interface for switching modes

### Dashboard Component
- Sidebar with user list
- Chat area showing messages
- Real-time message updates
- User profile & logout button
- Message input form

## 🔐 Security Features

- Passwords hashed with bcryptjs
- JWT token-based authentication
- Tokens stored in localStorage
- Session persistence
- CORS enabled for frontend

## 🚦 Running the Application

### Terminal 1 - Backend
```bash
cd backend
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

### Test the App
1. Open http://127.0.0.1:3000
2. Register User A
3. Open another tab, Register User B
4. Send messages between users
5. See real-time updates via Socket.IO!

## 📦 Dependencies

### Backend
- express: Web server
- socket.io: Real-time communication
- bcryptjs: Password hashing
- jsonwebtoken: Authentication
- sqlite3: Database
- cors: Cross-origin requests
- dotenv: Environment variables

### Frontend
- react: UI library
- axios: HTTP requests
- socket.io-client: Socket.IO client
- react-scripts: Build tools

## 🎓 Key Differences from Streamlit Version

| Feature | Streamlit | React |
|---------|-----------|-------|
| Frontend | Python UI library | React Components |
| Backend | Flask/Socket.IO | Express/Socket.IO |
| Styling | CSS in Streamlit | CSS Modules |
| State Management | Session state | React Hooks |
| API | Direct DB access | REST API |
| Real-time | Socket.IO (optional) | Socket.IO (built-in) |

## 🔧 Development

### Add New Features
1. Backend: Add API routes in `server.js`
2. Frontend: Create React components in `src/components/`
3. Database: Modify SQLite schema in `initDB()` function

### Styling
- Edit `.css` files for component styles
- Update `Dashboard.css` and `Auth.css` for themes

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
)
```

## 🐛 Troubleshooting

### Port already in use
- Backend: Change port in `server.js` (default 5000)
- Frontend: Change port in `package.json` (default 3000)

### Socket.IO connection fails
- Ensure backend is running on port 5000
- Check CORS settings in `server.js`
- Verify frontend URL is http://127.0.0.1:3000

### Messages not appearing
- Check browser console for errors
- Verify backend API is responding
- Check Socket.IO connection status

## 📈 Future Enhancements

- [ ] Message search functionality
- [ ] Typing indicators
- [ ] Message read receipts
- [ ] User online/offline status
- [ ] Message reactions/emojis
- [ ] File sharing
- [ ] Group chats
- [ ] User profile customization
- [ ] Message encryption
- [ ] Push notifications

## 📄 License

This project is open source and available for personal and educational use.
