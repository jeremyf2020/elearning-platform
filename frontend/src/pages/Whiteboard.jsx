import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

function Whiteboard() {
    const { roomName } = useParams();
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Store last position to draw smooth lines
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // 1. Connect to WebSocket
        const socket = new WebSocket(`ws://localhost:8000/ws/whiteboard/${roomName}/`);
        socketRef.current = socket;

        socket.onopen = () => console.log("Whiteboard Connected");
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // If data comes from another user, draw it
            drawOnCanvas(data.x0, data.y0, data.x1, data.y1, data.color, false);
        };

        return () => socket.close();
    }, [roomName]);

    // Helper to draw a line segment
    const drawOnCanvas = (x0, y0, x1, y1, color, emit) => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        if (!emit) return;

        // Send to backend
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                x0, y0, x1, y1, color
            }));
        }
    };

    const startDrawing = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        setIsDrawing(true);
        lastPos.current = { x: offsetX, y: offsetY };
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        
        // Draw locally AND send to server
        drawOnCanvas(lastPos.current.x, lastPos.current.y, offsetX, offsetY, 'black', true);
        
        lastPos.current = { x: offsetX, y: offsetY };
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Live Whiteboard: {roomName}</h2>
            <p>Click and drag to draw</p>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ border: '2px solid #333', cursor: 'crosshair', background: '#fff' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
        </div>
    );
}

export default Whiteboard;