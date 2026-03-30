import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Initialize socket and fetch users
  useEffect(() => {
    // Connect to socket using current host (works with localhost and IP)
    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('login', { userId: user.id, username: user.username });
    });

    newSocket.on('receive_message', (data) => {
      if (selectedUser && data.senderId === selectedUser.id) {
        setMessages(prev => [...prev, {
          sender_id: data.senderId,
          message: data.message,
          timestamp: data.timestamp
        }]);
      }
    });

    setSocket(newSocket);

    // Fetch users
    fetchUsers();

    return () => newSocket.close();
  }, [user, selectedUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `/api/users?exclude=${user.id}`
      );
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSelectUser = async (selectedUser) => {
    setSelectedUser(selectedUser);
    setLoading(true);
    
    // Close sidebar on mobile/tablet when user starts chatting
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
    
    try {
      const response = await axios.get(
        `/api/messages?userId1=${user.id}&userId2=${selectedUser.id}`
      );
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !selectedUser) return;

    const message = currentMessage;
    setCurrentMessage('');

    // Emit via socket
    if (socket) {
      socket.emit('send_message', {
        senderId: user.id,
        receiverId: selectedUser.id,
        message
      });
    }

    // Add to UI immediately
    const timestamp = new Date().toLocaleString();
    setMessages(prev => [...prev, {
      sender_id: user.id,
      message,
      timestamp
    }]);
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;
    
    if (!window.confirm(`Are you sure you want to delete all messages with ${selectedUser.username}?`)) {
      return;
    }

    try {
      const response = await axios.delete('/api/messages', {
        data: {
          userId1: user.id,
          userId2: selectedUser.id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Delete response:', response.data);
      setMessages([]);
      console.log('Chat cleared successfully');
    } catch (err) {
      console.error('Failed to clear chat:', err.response?.data || err.message);
      alert(`Failed to clear chat: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleClearChatFromMenu = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to delete all messages with ${targetUser.username}?`)) {
      return;
    }

    try {
      const response = await axios.delete('http://localhost:5000/api/messages', {
        data: {
          userId1: user.id,
          userId2: targetUser.id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response:', response.data);
      
      // If this is the currently selected user, clear messages
      if (selectedUser?.id === targetUser.id) {
        setMessages([]);
      }
      
      setOpenMenuId(null);
      console.log('Chat cleared successfully');
    } catch (err) {
      console.error('Failed to clear chat:', err.response?.data || err.message);
      alert(`Failed to clear chat: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <button 
          className="hamburger-menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Hide users' : 'Show users'}
        >
          ☰
        </button>
        <h1>💬 ChatBox</h1>
        <div className="header-right">
          <span className="user-info">👤 {user.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar - Users List */}
        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <h2>👥 Users</h2>
          <div className="users-list">
            {users.length === 0 ? (
              <p className="no-users">No users available</p>
            ) : (
              users.map(u => (
                <div key={u.id} className="user-item-wrapper">
                  <button
                    className={`user-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                    onClick={() => handleSelectUser(u)}
                  >
                    👤 {u.username}
                  </button>
                  <div className="user-menu-container">
                    <button 
                      className="menu-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === u.id ? null : u.id);
                      }}
                    >
                      ⋮
                    </button>
                    {openMenuId === u.id && (
                      <div className="user-menu">
                        <button 
                          className="menu-option"
                          onClick={() => handleClearChatFromMenu(u)}
                        >
                          🗑️ Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <h2>💬 Chat with {selectedUser.username}</h2>
              </div>

              <div className="messages-container">
                {loading ? (
                  <div className="loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{msg.message}</p>
                        <small>{msg.timestamp}</small>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-form">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button type="submit" className="send-btn">Send</button>
              </form>
            </>
          ) : (
            <div className="no-selection">
              <h2>Select a user to start chatting</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
