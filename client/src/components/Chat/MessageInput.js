import React, { useState, useRef } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Индикатор печатания
    onTyping(true);
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || mediaFiles.length > 0) {
      onSendMessage(message, mediaFiles);
      setMessage('');
      setMediaFiles([]);
      onTyping(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const handleVoiceRecord = () => {
    // TODO: Реализовать запись голоса
    setIsRecording(!isRecording);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="message-input-container">
      {mediaFiles.length > 0 && (
        <div className="media-preview">
          {mediaFiles.map((file, index) => (
            <div key={index} className="media-preview-item">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt="preview" />
              ) : (
                <div className="file-icon">{file.name}</div>
              )}
              <button onClick={() => removeMedia(index)}>×</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,audio/*"
        />
        
        <button
          type="button"
          className="attach-button"
          onClick={() => fileInputRef.current.click()}
        >
          📎
        </button>
        
        <button
          type="button"
          className={`voice-button ${isRecording ? 'recording' : ''}`}
          onClick={handleVoiceRecord}
        >
          🎤
        </button>
        
        <input
          type="text"
          className="message-field"
          placeholder="Написать сообщение..."
          value={message}
          onChange={handleChange}
        />
        
        <button type="submit" className="send-button">
          ➤
        </button>
      </form>
    </div>
  );
};

export default MessageInput;