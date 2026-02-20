import React from 'react';
import Avatar from '../UI/Avatar';
import MessageMedia from './MessageMedia';
import './Message.css';

const Message = ({ message, isOwn, showAvatar }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRead = message.readBy?.length > 1; // Больше одного = прочитано (отправитель + получатель)

  return (
    <div className={`message-wrapper ${isOwn ? 'own' : ''}`}>
      {!isOwn && showAvatar && (
        <Avatar 
          src={message.sender.avatar} 
          name={message.sender.name} 
          size={36} 
          className="message-avatar"
        />
      )}
      
      <div className={`message-bubble ${isOwn ? 'own' : ''}`}>
        {!isOwn && !showAvatar && <div className="avatar-placeholder" />}
        
        <div className="message-content">
          {!isOwn && showAvatar && (
            <div className="message-sender-name">{message.sender.name}</div>
          )}
          
          {message.media && message.media.length > 0 && (
            <MessageMedia media={message.media} />
          )}
          
          {message.text && (
            <div className="message-text">{message.text}</div>
          )}
          
          <div className="message-footer">
            <span className="message-time">{formatTime(message.createdAt)}</span>
            {isOwn && (
              <span className="message-status">
                {isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;