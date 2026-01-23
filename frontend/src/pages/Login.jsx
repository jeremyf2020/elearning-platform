import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth(); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/'); 
        } catch (err) {
            console.error("Login failed", err);
            setError('Invalid username or password');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Sign In</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    placeholder="Username" 
                    value={username}
                    onChange={e => setUsername(e.target.value)} 
                    style={{ padding: '8px' }}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                    style={{ padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px', background: '#646cff', color: 'white', border: 'none' }}>
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;