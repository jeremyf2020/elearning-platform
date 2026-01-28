import { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat'; 
import { useAuth } from './context/AuthContext';
import Whiteboard from './pages/Whiteboard'; 
import AudioRoom from './pages/AudioRoom'; 


function Home() {
  const { user } = useAuth();
  const [room, setRoom] = useState('general');

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to E-Learning</h1>
      {user ? (
        <div>
          <p style={{ color: 'green' }}>You are logged in as <strong>{user.username}</strong></p>
          
          <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', display: 'inline-block' }}>
            <h3>Join a Chat Room</h3>
            <input 
              value={room} 
              onChange={(e) => setRoom(e.target.value)} 
              placeholder="Room Name" 
              style={{ padding: '5px' }}
            />
            <br/><br/>
            <Link to={`/chat/${room}`}>
              <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Go to Chat</button>
            </Link>
          </div>
        </div>
      ) : (
        <p>Please <Link to="/login">Login</Link> to access courses and chat.</p>
      )}
    </div>
  );
}

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <Navbar user={user?.username} onLogout={logout} />
      
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat/:roomName" element={<Chat />} /> 
          <Route path="/whiteboard/:roomName" element={<Whiteboard />} />
          <Route path="/audio/:roomName" element={<AudioRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;