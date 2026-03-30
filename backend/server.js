const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static React frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Database setup
const DB_PATH = path.join(__dirname, 'chatbox.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✓ Database connected');
});

// Initialize database
const initDB = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )
    `);
  });
};

initDB();

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.json({ message: 'Registration successful', userId: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  const userId = req.query.exclude;
  
  const query = userId 
    ? 'SELECT id, username FROM users WHERE id != ? ORDER BY username'
    : 'SELECT id, username FROM users ORDER BY username';
    
  const params = userId ? [userId] : [];

  db.all(query, params, (err, users) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(users || []);
  });
});

// Get messages between two users
app.get('/api/messages', (req, res) => {
  const { userId1, userId2 } = req.query;

  if (!userId1 || !userId2) {
    return res.status(400).json({ error: 'Both user IDs required' });
  }

  db.all(
    `SELECT sender_id, message, timestamp FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
     OR (sender_id = ? AND receiver_id = ?)
     ORDER BY timestamp ASC`,
    [userId1, userId2, userId2, userId1],
    (err, messages) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(messages || []);
    }
  );
});

// Save message
app.post('/api/messages', (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
    [senderId, receiverId, message],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to save message' });
      res.json({ message: 'Message saved', messageId: this.lastID });
    }
  );
});

// Delete all messages between two users
app.delete('/api/messages', (req, res) => {
  const { userId1, userId2 } = req.body;

  console.log('Delete request received with:', { userId1, userId2 });

  if (!userId1 || !userId2) {
    console.log('Missing user IDs - returning 400');
    return res.status(400).json({ error: 'Both user IDs required' });
  }

  db.run(
    `DELETE FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
     OR (sender_id = ? AND receiver_id = ?)`,
    [userId1, userId2, userId2, userId1],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete messages' });
      }
      console.log('Messages deleted successfully. Count:', this.changes);
      res.json({ message: 'Chat cleared successfully', deletedCount: this.changes });
    }
  );
});

// Socket.IO events
let activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('login', (data) => {
    activeUsers[socket.id] = {
      userId: data.userId,
      username: data.username
    };
    socket.join(`user_${data.userId}`);
    console.log(`User logged in: ${data.username}`);
  });

  socket.on('send_message', (data) => {
    const { senderId, receiverId, message } = data;
    const timestamp = new Date().toLocaleString();

    // Save to database
    db.run(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [senderId, receiverId, message]
    );

    // Broadcast to receiver
    io.to(`user_${receiverId}`).emit('receive_message', {
      senderId,
      message,
      timestamp
    });

    // Confirm to sender
    io.to(`user_${senderId}`).emit('message_sent', {
      receiverId,
      message,
      timestamp
    });
  });

  socket.on('disconnect', () => {
    delete activeUsers[socket.id];
    console.log('User disconnected:', socket.id);
  });
});

// Serve React frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`\n✓ Server running on http://${HOST}:${PORT}`);
  console.log(`✓ Socket.IO listening on http://${HOST}:${PORT}\n`);
});
