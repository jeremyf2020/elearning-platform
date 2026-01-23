import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('username');

            if (token && savedUser) {
                setUser({ username: savedUser });
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (username, password) => {
        const response = await api.post('login/', { username, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        setUser({ username: response.data.username });
        return response.data;
    };

    const register = async (username, email, password) => {
        const response = await api.post('register/', { username, email, password });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        setUser({ username: response.data.username });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);