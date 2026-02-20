import React, { useState, useEffect } from 'react';
import Avatar from '../UI/Avatar';
import API from '../../utils/api';
import './ChatList.css';

const ChatList = ({ chats, selectedChat, onSelectChat, onlineUsers, currentUser, onCreateNewChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    setSearchTerm(query);
    
    if (query.trim()) {
      setIsSearching(true);
      try {
        const response = await API.get(`/users/search?query=${query}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Ошибка поиска:', error);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    return messageDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <div className="user-info">
          <Avatar src={currentUser.avatar} name={currentUser.name} size={40} />
          <span className="user-name">{currentUser.name}</span>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="chats-container">
        {isSearching ? (
          // Результаты поиска
          searchResults.map(user => (
            <div
              key={user._id}
              className="chat-item"
              onClick={() => {
                onCreateNewChat(user._id);
                setSearchTerm('');
                setIsSearching(false);
              }}
            >
              <Avatar src={user.avatar} name={user.name} size={48} />
              <div className="chat-info">
                <div className="chat-name">{user.name}</div>
                <div className="chat-last-message">{user.email}</div>
              </div>
              <div className={`online-indicator ${onlineUsers[user._id]?.isOnline ? 'online' : ''}`} />
            </div>
          ))
        ) : (
          // Список чатов
          chats.map(chat => {
            const otherParticipant = chat.participants.find(p => p._id !== currentUser.id);
            const isOnline = onlineUsers[otherParticipant?._id]?.isOnline;
            
            return (
              <div
                key={chat._id}
                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <Avatar src={otherParticipant?.avatar} name={otherParticipant?.name} size={48} />
                <div className="chat-info">
                  <div className="chat-name">{otherParticipant?.name}</div>
                  <div className="chat-last-message">
                    {chat.lastMessage?.text || 'Нет сообщений'}
                  </div>
                </div>
                <div className="chat-meta">
                  {chat.lastMessage && (
                    <span className="chat-time">{formatTime(chat.lastMessageAt)}</span>
                  )}
                  <div className={`online-dot ${isOnline ? 'online' : ''}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;