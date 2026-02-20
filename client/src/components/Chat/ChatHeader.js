import React from 'react';
import Avatar from '../UI/Avatar';
import './ChatHeader.css';

const ChatHeader = ({ chat, currentUser, onlineUsers, onLogout }) => {
  const otherParticipant = chat.participants.find(p => p._id !== currentUser.id);
  const isOnline = onlineUsers[otherParticipant?._id]?.isOnline;

  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <Avatar src={otherParticipant?.avatar} name={otherParticipant?.name} size={40} />
        <div className="chat-header-text">
          <h3>{otherParticipant?.name}</h3>
          <span className={`status ${isOnline ? 'online' : ''}`}>
            {isOnline ? 'в сети' : 'был(а) недавно'}
          </span>
        </div>
      </div>
      
      <button onClick={onLogout} className="logout-button">
        Выйти
      </button>
    </div>
  );
};

export default ChatHeader;