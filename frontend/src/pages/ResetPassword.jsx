import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Notification from '../components/Notification';

export default function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notify, setNotify] = useState({ show: false, message: '', type: 'error' });
    const [loading, setLoading] = useState(false);

    const showNotify = (message, type = 'error') => {
        setNotify({ show: true, message, type });
    };

    const closeNotify = () => {
        setNotify(prev => ({ ...prev, show: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showNotify('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('http://localhost:8000/api/password-reset-confirm/', {
                uid,
                token,
                new_password: password
            });
            showNotify('Password reset successful! You can now log in.', 'success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            showNotify(err.response?.data?.error || 'Invalid or expired link');
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
            <Notification
                show={notify.show}
                message={notify.message}
                type={notify.type}
                onClose={closeNotify}
            />
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Reset Password</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your new password below.</p>
                </div>

                {notify.type === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px' }}>
                            {notify.message}
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">New Password</label>
                            <input
                                type="password"
                                className="input"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">Confirm New Password</label>
                            <input
                                type="password"
                                className="input"
                                required
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
