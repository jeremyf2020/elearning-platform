import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Chat() {
    const { roomName } = useParams(); // Get room name from URL (e.g. /chat/math101)
    const { user } = useAuth(); 
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        // 1. Connect to WebSocket
        const socket = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);
        socketRef.current = socket;

        // 2. Listen for messages
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        socket.onopen = () => {
            console.log("Connected to Chat Room");
        };

        socket.onclose = () => {
            console.log("Disconnected");
        };

        // 3. Cleanup on component unmount
        return () => {
            socket.close();
        };
    }, [roomName]);

    const sendMessage = () => {
        if (messageInput.trim() === '') return;

        // Send JSON data to backend
        socketRef.current.send(JSON.stringify({
            message: messageInput,
            username: user ? user.username : 'Anonymous'
        }));

        setMessageInput('');
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd' }}>
            <h2>Room: {roomName}</h2>
            
            {/* Message Area */}
            <div style={{ 
                height: '300px', 
                overflowY: 'scroll', 
                background: '#f9f9f9', 
                border: '1px solid #eee',
                marginBottom: '10px',
                padding: '10px'
            }}>
                {messages.length === 0 ? <p style={{color: '#ccc'}}>No messages yet...</p> : null}
                
                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#007bff' }}>{msg.username}: </strong> 
                        <span>{msg.message}</span>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '10px' }}
                />
                <button onClick={sendMessage} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;