import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(formData.username, formData.email, formData.password);
            navigate('/'); // Redirect to Home on success
        } catch (err) {
            console.error("Registration failed", err);
            // Try to show the specific error from Django (e.g., "Username taken")
            if (err.response && err.response.data) {
                // If the error is a simple object like { error: "msg" } or { username: ["msg"] }
                const msg = err.response.data.error || Object.values(err.response.data)[0];
                setError(msg || "Registration failed");
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Create Account</h2>
            {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    name="username"
                    placeholder="Username" 
                    value={formData.username}
                    onChange={handleChange} 
                    required
                    style={{ padding: '10px' }}
                />
                <input 
                    name="email"
                    type="email"
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={handleChange} 
                    required
                    style={{ padding: '10px' }}
                />
                <input 
                    name="password"
                    type="password" 
                    placeholder="Password" 
                    value={formData.password}
                    onChange={handleChange} 
                    required
                    style={{ padding: '10px' }}
                />
                <input 
                    name="confirmPassword"
                    type="password" 
                    placeholder="Confirm Password" 
                    value={formData.confirmPassword}
                    onChange={handleChange} 
                    required
                    style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '12px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Register
                </button>
            </form>
        </div>
    );
}

export default Register;