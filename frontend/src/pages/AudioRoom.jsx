import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

function AudioRoom() {
    const { roomName } = useParams();
    const { user } = useAuth();
    const [status, setStatus] = useState("Initializing...");
    const [logs, setLogs] = useState([]); 
    
    const localStreamRef = useRef(null);
    const socketRef = useRef(null);
    const peersRef = useRef({}); 
    const audioContainerRef = useRef(null);

    const addLog = (msg) => {
        console.log(msg);
        setLogs(prev => [...prev.slice(-4), msg]); 
    };

    useEffect(() => {
        const startAudio = async () => {
            try {
                addLog("Requesting Microphone...");
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                localStreamRef.current = stream;
                addLog("Microphone Access Granted.");

                // --- FIX STARTS HERE ---
                // 1. Get the HTTP URL (e.g., http://localhost:8000/api/)
                let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
                
                // 2. Remove the '/api/' suffix if it exists
                baseUrl = baseUrl.replace(/\/api\/?$/, '');
                
                // 3. Remove trailing slash to avoid double slashes
                baseUrl = baseUrl.replace(/\/$/, '');
                
                // 4. Change http -> ws (or https -> wss)
                const wsUrl = baseUrl.replace(/^http/, 'ws');
                
                addLog(`Connecting to: ${wsUrl}/ws/chat/${roomName}/`);
                const socket = new WebSocket(`${wsUrl}/ws/chat/${roomName}/`);
                // --- FIX ENDS HERE ---

                socketRef.current = socket;

                socket.onopen = () => {
                    setStatus("Connected. Waiting for others...");
                    addLog("WebSocket Open. Announcing presence...");
                    socket.send(JSON.stringify({
                        type: 'signal',
                        subtype: 'new-peer',
                        username: user?.username || 'Anonymous'
                    }));
                };

                socket.onmessage = handleSignalMessage;
                socket.onerror = (e) => addLog("WebSocket Error (Check console)");

            } catch (err) {
                console.error("Error accessing microphone:", err);
                setStatus("Error: Microphone access denied or not found.");
                addLog("Mic Error: " + err.message);
            }
        };

        if (user) startAudio();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) socketRef.current.close();
        };
    }, [roomName, user]);

    const handleSignalMessage = async (event) => {
        const data = JSON.parse(event.data);
        const { subtype, username, sdp, candidate } = data;

        if (username === user?.username) return; 

        try {
            if (subtype === 'new-peer') {
                addLog(`User ${username} joined. calling...`);
                createPeerConnection(username, true);
            }
            else if (subtype === 'offer') {
                addLog(`Received offer from ${username}`);
                const pc = createPeerConnection(username, false);
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                socketRef.current.send(JSON.stringify({
                    type: 'signal',
                    subtype: 'answer',
                    username: user?.username,
                    target: username,
                    sdp: answer
                }));
            }
            else if (subtype === 'answer') {
                addLog(`Received answer from ${username}`);
                const pc = peersRef.current[username]; 
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                }
            }
            else if (subtype === 'candidate') {
                const pc = peersRef.current[username];
                if (pc) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
            }
        } catch (err) {
            addLog(`Signaling Error: ${err.message}`);
        }
    };

    const createPeerConnection = (remoteUsername, isInitiator) => {
        if (peersRef.current[remoteUsername]) return peersRef.current[remoteUsername];

        addLog(`Creating Connection for ${remoteUsername}...`);
        const pc = new RTCPeerConnection(RTC_CONFIG);
        peersRef.current[remoteUsername] = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.send(JSON.stringify({
                    type: 'signal',
                    subtype: 'candidate',
                    username: user?.username,
                    target: remoteUsername, 
                    candidate: event.candidate
                }));
            }
        };

        pc.ontrack = (event) => {
            addLog(`Receiving Audio Track from ${remoteUsername}!`);
            const audioElement = document.createElement('audio');
            audioElement.srcObject = event.streams[0];
            audioElement.autoplay = true;
            audioElement.controls = true;
            audioContainerRef.current.appendChild(audioElement);
        };

        // Add our mic
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        }

        if (isInitiator) {
            pc.onnegotiationneeded = async () => {
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socketRef.current.send(JSON.stringify({
                        type: 'signal',
                        subtype: 'offer',
                        username: user?.username,
                        target: remoteUsername,
                        sdp: offer
                    }));
                } catch (err) {
                    addLog("Negotiation Error: " + err.message);
                }
            };
        }

        return pc;
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px', maxWidth: '600px', margin: '20px auto' }}>
            <h2>Live Audio Room: {roomName}</h2>
            
            <div style={{ padding: '15px', background: '#eef', borderRadius: '8px', marginBottom: '20px' }}>
                <p><strong>Status:</strong> {status}</p>
                <div style={{ textAlign: 'left', fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>
                    {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
            </div>

            <div ref={audioContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Audio elements appear here */}
            </div>
            
            <button onClick={() => window.location.reload()} style={{padding: '10px', cursor: 'pointer'}}>
                Reconnect
            </button>
        </div>
    );
}

export default AudioRoom;