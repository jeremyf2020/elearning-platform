import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Register from './pages/Register'; 
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <Navbar user={user?.username} onLogout={logout} />
      
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={
            <div style={{ textAlign: 'center' }}>
              <h2>Welcome to the Course Platform!</h2>
              {user ? <p>You are logged in as {user.username}</p> : <p>Please login to see your courses.</p>}
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />  
        </Routes>
      </div>
    </Router>
  );
}

export default App;