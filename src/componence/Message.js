import React from 'react';

export default function Message({ msg }) {
  const renderMessage = () => {
    if (msg.type === 'text') {
      return (
        <div className="msg-bubble text">
          <div className="msg-text">{msg.text}</div>
          <div className="msg-meta">{new Date(msg.createdAt).toLocaleString()}</div>
        </div>
      );
    }
    if (msg.type === 'image') {
      return (
        <div className="msg-bubble image">
          <img src={msg.url} alt={msg.fileName || 'image'} className="msg-image" />
          <div className="msg-meta">{msg.fileName}</div>
        </div>
      );
    }
    if (msg.type === 'voice') {
      return (
        <div className="msg-bubble voice">
          <audio controls src={msg.url} className="msg-audio" />
          <div className="msg-meta">Voice • {new Date(msg.createdAt).toLocaleString()}</div>
        </div>
      );
    }
    return null;
  };

  return <>{renderMessage()}</>;
}
