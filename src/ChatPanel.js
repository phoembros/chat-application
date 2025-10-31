import React, { useState, useRef } from 'react';
import './ChatPanel.css';
import Message  from './componence/Message';
import useVoiceRecorder  from './componence/VoiceRecorder';

export default function ChatPanel({ onSend }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);

  const addMessage = (msg) => {
    setMessages((m) => [...m, msg]);
    onSend && onSend(msg);
  };

  const { isRecording, mediaSupported, startRecording, stopRecording } = useVoiceRecorder(addMessage);

  const handleSendText = (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    addMessage({ id: Date.now(), type: 'text', text: trimmed, createdAt: new Date().toISOString() });
    setInput('');
  };

  const handleImagePick = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addMessage({ id: Date.now(), type: 'image', fileName: file.name, file, url, createdAt: new Date().toISOString() });
    e.target.value = null;
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">KH-Chat</div>
        <div className="chat-sub">Text • Image • Voice</div>
      </div>

      <div className="chat-body" id="chatBody">
        {messages.length === 0 ? (
          <div className="empty">No messages yet — say hello 👋</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="chat-row">
              <div className="avatar">U</div>
              <div className="chat-msg"><Message msg={m} /></div>
            </div>
          ))
        )}
      </div>

      <form className="chat-composer" onSubmit={handleSendText}>
        <div className="controls">
          <label className="icon-btn" title="Attach image">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden-file" onChange={handleImagePick} />
            📷
          </label>

          <button
            type="button"
            className={`icon-btn record ${isRecording ? 'recording' : ''}`}
            disabled={!mediaSupported}
            onMouseDown={(e) => { e.preventDefault(); startRecording(); }}
            onMouseUp={(e) => { e.preventDefault(); stopRecording(); }}
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
            title={mediaSupported ? (isRecording ? 'Release to stop' : 'Hold to record') : 'Voice not supported'}
          >
            🎤 
          </button>
        </div>

        <input className="text-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write a message..." />
        <button className="send-btn" type="submit">Send</button>
      </form>
    </div>
  );
}
