import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import ChatList from './ChatList';
import ChatHeader from './ChatHeader';
import Message from './Message';
import MessageInput from './MessageInput';
import API from '../../utils/api';
import './Chat.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      console.log('Creating socket for user:', user.id);
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        newSocket.emit('user_online', user.id);
      });

      newSocket.on('new_message', ({ chatId, message }) => {
        console.log('📨 New message received:', message);
        if (selectedChat?._id === chatId) {
          setMessages(prev => [...prev, message]);
        }
        
        // Обновляем список чатов
        setChats(prev => prev.map(chat => 
          chat._id === chatId 
            ? { ...chat, lastMessage: message, lastMessageAt: message.createdAt }
            : chat
        ));
      });

      newSocket.on('user_status', ({ userId, isOnline, lastSeen }) => {
        setOnlineUsers(prev => ({
          ...prev,
          [userId]: { isOnline, lastSeen }
        }));
      });

      newSocket.on('user_typing', ({ chatId, userId, isTyping }) => {
        if (selectedChat?._id === chatId && userId !== user.id) {
          setTypingUsers(prev => ({
            ...prev,
            [userId]: isTyping
          }));
        }
      });

      // Загрузка чатов
      loadChats();

      return () => {
        console.log('❌ Socket disconnected');
        newSocket.disconnect();
      };
    }
  }, [user, selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat._id);
      socket?.emit('join_chat', selectedChat._id);
      
      return () => {
        socket?.emit('leave_chat', selectedChat._id);
      };
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      const response = await API.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await API.get(`/messages/${chatId}`);
      setMessages(response.data);
      
      // Отмечаем как прочитанные
      await API.post(`/messages/read/${chatId}`);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const sendMessage = async (text, media = []) => {
    if (!text.trim() && media.length === 0) return;

    const formData = new FormData();
    formData.append('chatId', selectedChat._id);
    formData.append('text', text);
    
    media.forEach(file => {
      formData.append('media', file);
    });

    try {
      console.log('Sending message...');
      const response = await API.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Message sent to server:', response.data);
      
      // Отправляем через socket
      if (socket) {
        socket.emit('send_message', {
          chatId: selectedChat._id,
          message: response.data
        });
        console.log('Message emitted via socket');
      }
      
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
    }
  };

  const handleTyping = (isTyping) => {
    if (selectedChat) {
      socket?.emit('typing', {
        chatId: selectedChat._id,
        userId: user.id,
        isTyping
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewChat = async (participantId) => {
    try {
      const response = await API.post('/chats', { participantId });
      setChats(prev => [response.data, ...prev]);
      setSelectedChat(response.data);
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  };

  return (
    <div className="chat-app">
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onlineUsers={onlineUsers}
        currentUser={user}
        onCreateNewChat={createNewChat}
      />
      
      <div className="chat-main">
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              currentUser={user}
              onlineUsers={onlineUsers}
              onLogout={logout}
            />
            
            <div className="messages-container">
              {messages.map((message, index) => (
                <Message
                  key={message._id}
                  message={message}
                  isOwn={message.sender?._id === user.id}
                  showAvatar={index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id}
                />
              ))}
              
              {typingUsers[selectedChat.participants?.find(p => p._id !== user.id)?._id] && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <MessageInput
              onSendMessage={sendMessage}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <h2>Добро пожаловать в мессенджер</h2>
              <p>Выберите чат или создайте новый</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;