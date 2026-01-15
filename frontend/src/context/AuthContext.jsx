import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = localStorage.getItem('divideit_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to initialize auth:", error);
                localStorage.removeItem('divideit_user');
            } finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post('http://localhost:8000/api/login/', { username, password });
            setUser(res.data);
            localStorage.setItem('divideit_user', JSON.stringify(res.data));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Invalid credentials' };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('http://localhost:8000/api/register/', userData);
            // Auto login after register
            return login(userData.email, userData.password);
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('divideit_user');
    };

    const updateUser = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('divideit_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
