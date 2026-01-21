import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav style={{ padding: '15px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <div className="logo">E-Learning</div>
      
      <div className="links">
        <Link to="/" style={{ color: 'white', marginRight: '15px' }}>Home</Link>
        
        {user ? (
          // IF LOGGED IN: Show Username and Logout
          <span>
            <span style={{ marginRight: '15px', color: '#4CAF50' }}>Hello, {user}</span>
            <button onClick={onLogout}>Logout</button>
          </span>
        ) : (
          // IF LOGGED OUT: Show Login/Register
          <span>
            <Link to="/login" style={{ color: 'white', marginRight: '15px' }}>Login</Link>
            <Link to="/register" style={{ color: 'white' }}>Register</Link>
          </span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;