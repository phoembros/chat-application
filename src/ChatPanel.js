import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';


export default function ChatPanel({ onSend }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const fileInputRef = useRef(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    if (navigator.mediaDevices && window.MediaRecorder) setMediaSupported(true);
  }, []);

  function addMessage(msg) {
    setMessages((m) => [...m, msg]);
    if (onSend) onSend(msg);
  }

  function handleSendText(e) {
    e && e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const msg = {
      id: Date.now(),
      type: 'text',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    addMessage(msg);
    setInput('');
  }

  function handleImagePick(e) {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const msg = {
      id: Date.now(),
      type: 'image',
      fileName: file.name,
      file,
      url,
      createdAt: new Date().toISOString(),
    };
    addMessage(msg);
    e.target.value = null;
  }

  async function startRecording() {
    if (!mediaSupported) return;
    recordedChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const msg = {
          id: Date.now(),
          type: 'voice',
          file: blob,
          url,
          createdAt: new Date().toISOString(),
        };
        addMessage(msg);
        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error', err);
      alert('Could not access microphone. Check permissions.');
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.stop();
      setIsRecording(false);
    }
  }

  function renderMessage(msg) {
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
  }

  // hello

  // Test command
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">Chat</div>
        <div className="chat-sub">Text • Image • Voice</div>
      </div>

      <div className="chat-body" id="chatBody">
        {messages.length === 0 ? (
          <div className="empty">No messages yet — say hello 👋</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="chat-row">
              <div className="avatar">U</div>
              <div className="chat-msg">{renderMessage(m)}</div>
            </div>
          ))
        )}
      </div>

      <form className="chat-composer" onSubmit={handleSendText}>
        <div className="controls">
          <label className="icon-btn" title="Attach image">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden-file"
              onChange={handleImagePick}
            />
            📷
          </label>

          <button
            type="button"
            className={`icon-btn record ${isRecording ? 'recording' : ''}`}
            disabled={!mediaSupported}
            onMouseDown={(e) => {
              e.preventDefault();
              if (!isRecording) startRecording();
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              if (isRecording) stopRecording();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              if (!isRecording) startRecording();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (isRecording) stopRecording();
            }}
            title={mediaSupported ? (isRecording ? 'Release to stop' : 'Hold to record') : 'Voice not supported'}
          >
            🎤
          </button>
        </div>

        <input
          className="text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message..."
        />

        <button className="send-btn" type="submit">Send</button>
      </form>
    </div>
  );
}
 