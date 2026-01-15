import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { User, Mail, Shield, TrendingUp, Calendar } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        username: user?.username || '',
        avatar_url: user?.avatar_url || ''
    });
    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/usage/${user?.id}/`);
                setUsageData(res.data);
            } catch (error) {
                console.error("Failed to fetch usage data");
            }
        };
        if (user) fetchUsage();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`http://localhost:8000/api/profile/${user.id}/update/`, profile);
            updateUser(res.data.user);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Account Settings</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>

                {/* Profile Settings */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <Avatar user={{ ...user, avatar_url: profile.avatar_url }} size="xl" />
                        <div>
                            <h3 style={{ margin: 0 }}>Personal Info</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your identity</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label className="label" style={{ marginBottom: '1rem', display: 'block' }}>Choose Avatar</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['', 'avatar1', 'avatar2', 'avatar3'].map((av) => (
                                <div
                                    key={av}
                                    onClick={() => setProfile({ ...profile, avatar_url: av })}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '50%',
                                        border: profile.avatar_url === av ? '2px solid var(--primary)' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        background: profile.avatar_url === av ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Avatar user={{ ...user, avatar_url: av }} size="lg" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label className="label">First Name</label>
                            <input
                                type="text" className="input"
                                value={profile.first_name}
                                onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Last Name</label>
                            <input
                                type="text" className="input"
                                value={profile.last_name}
                                onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Username</label>
                            <input
                                type="text" className="input"
                                value={profile.username}
                                onChange={e => setProfile({ ...profile, username: e.target.value })}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            {success && (
                                <p style={{ color: 'var(--success)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                                    ✓ Profile updated successfully!
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Spending Chart */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'rgba(16, 185, 129, 0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', color: 'var(--success)'
                            }}>
                                <TrendingUp size={24} />
                            </div>
                            <h3 style={{ margin: 0 }}>Spending Analysis</h3>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} />
                            Monthly Usage
                        </div>
                    </div>

                    <div style={{ flex: 1, minHeight: '300px', marginTop: '1rem' }}>
                        {usageData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={usageData}>
                                    <defs>
                                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(val) => `₹${val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: 'var(--primary)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorUsage)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                No spending data available yet.
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Typical Monthly Spend</p>
                                <h2 style={{ margin: '0.25rem 0 0 0' }}>₹{usageData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h2>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Recorded</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{usageData.length} Months</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
