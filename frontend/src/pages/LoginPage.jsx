import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Assuming email is used as username for now in this simple flow
        const result = await login(formData.email, formData.password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back! Please sign in.</p>
                    {error && <p className="animate-shake" style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            required
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label className="label" style={{ marginBottom: 0 }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            className="input"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        Sign In
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
