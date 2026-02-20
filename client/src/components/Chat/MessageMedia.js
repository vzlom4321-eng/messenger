import React from 'react';

const MessageMedia = ({ media }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="message-media">
      {media.map((item, index) => (
        <div key={index} className="media-item">
          {item.type === 'image' && (
            <img 
              src={`http://localhost:5000${item.url}`} 
              alt="media" 
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
          )}
          {item.type === 'video' && (
            <video 
              src={`http://localhost:5000${item.url}`} 
              controls 
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
          )}
          {item.type === 'audio' && (
            <audio 
              src={`http://localhost:5000${item.url}`} 
              controls 
              style={{ width: '100%' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageMedia;