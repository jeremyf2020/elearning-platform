import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setGlobalUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/login/', { username, password });

            // Save token (usually to localStorage)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);

            // Update global state
            setGlobalUser(res.data.username);

            // Redirect Home
            navigate('/');
        } catch (err) {
            alert("Login failed!");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Sign In</h2>
            <form onSubmit={handleLogin}>
                <input placeholder="Username" onChange={e => setUsername(e.target.value)} /><br /><br />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br /><br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;