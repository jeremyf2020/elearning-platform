import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api/'}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Automatically add Token to headers if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;