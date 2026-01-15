import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetUrl, setResetUrl] = useState(''); // For demo purposes

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setResetUrl('');

        try {
            const res = await axios.post('http://localhost:8000/api/password-reset/', { email });
            setMessage(res.data.message);
            if (res.data.reset_url) {
                setResetUrl(res.data.reset_url);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
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
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Forgot Password?</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your email to receive a reset link.</p>
                </div>

                {message ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            {message}
                        </div>
                        {resetUrl && (
                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Simulated Email Link:</p>
                                <a href={resetUrl} style={{ color: 'var(--primary)', wordBreak: 'break-all', fontSize: '0.85rem' }}>{resetUrl}</a>
                            </div>
                        )}
                        <Link to="/login" className="btn btn-primary" style={{ display: 'block', textDecoration: 'none' }}>Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                className="input"
                                required
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
