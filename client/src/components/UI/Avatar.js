import React from 'react';
import './Avatar.css';

const Avatar = ({ src, name = 'User', size = 40, className = '' }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColor = (name) => {
    const colors = [
      '#4a90e2', '#e74c3c', '#2ecc71', '#f39c12', 
      '#9b59b6', '#1abc9c', '#e67e22', '#3498db'
    ];
    if (!name) return colors[0];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const style = {
    width: size,
    height: size,
    fontSize: size * 0.4
  };

  if (src && src !== 'default-avatar.png') {
    return (
      <img
        src={`http://localhost:5000${src}`}
        alt={name || 'avatar'}
        className={`avatar ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`avatar-placeholder ${className}`}
      style={{
        ...style,
        backgroundColor: getColor(name)
      }}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;