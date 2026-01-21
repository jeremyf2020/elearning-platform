import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
// import Register from './Register'; 

function App() {
  const [user, setUser] = useState(null);

  // Check if user is already logged in when page loads
  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<h2>Welcome to the Course Platform!</h2>} />
          <Route path="/login" element={<Login setGlobalUser={setUser} />} />
          {/* <Route path="/register" element={<Register />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;