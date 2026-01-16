import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { API_BASE_URL } from '../api/config';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [balance, setBalance] = useState({ you_owe: 0, owed_to_you: 0 });
    const [usageData, setUsageData] = useState([]);
    const [breakdown, setBreakdown] = useState([]);

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) return;
            try {
                // Fetch Balance
                const balRes = await axios.get(`${API_BASE_URL}/balance/${user.id}/`);
                setBalance({
                    you_owe: balRes.data.you_owe,
                    owed_to_you: balRes.data.owed_to_you
                });

                // Fetch Usage
                const useRes = await axios.get(`${API_BASE_URL}/usage/${user.id}/`);
                setUsageData(useRes.data);

                // Fetch Breakdown
                const breakRes = await axios.get(`${API_BASE_URL}/balance/breakdown/${user.id}/`);
                setBreakdown(breakRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data");
            }
        }
        fetchData();
    }, [user]);

    const totalBalance = balance.owed_to_you - balance.you_owe;
    const isPositive = totalBalance >= 0;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {/* Balance Cards (Unchanged in logic, just wrapping) */}
                <div className="card animate-slide-up delay-1" style={{ borderTop: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>You Owe</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: '#f87171' }}>₹{balance.you_owe}</h2>
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="card animate-slide-up delay-2" style={{ borderTop: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>You are Owed</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: '#34d399' }}>₹{balance.owed_to_you}</h2>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M7 7l9.2 9.2M17 7v10H7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="card animate-slide-up delay-3" style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(99, 102, 241, 0.1))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Net Balance</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: isPositive ? '#818cf8' : '#f87171' }}>
                                {isPositive ? '+' : '-'}₹{Math.abs(totalBalance)}
                            </h2>
                        </div>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Spending Trend */}
            <div className="card animate-slide-up delay-3" style={{ marginBottom: '2rem', minHeight: '350px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Monthly Spending Trend</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last 12 Months</span>
                </div>

                <div style={{ height: '240px', width: '100%' }}>
                    {usageData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageData}>
                                <defs>
                                    <linearGradient id="colorUsageDash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <YAxis
                                    hide
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsageDash)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <p>Spend some money to see your trend! 💸</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="card animate-slide-up delay-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Friends to Settle</h3>
                    <span
                        onClick={() => navigate('/groups')}
                        style={{ fontSize: '0.9rem', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                        View All
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {breakdown.length > 0 ? breakdown.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.25rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            transition: 'background 0.2s',
                            border: '1px solid rgba(255,255,255,0.03)'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Avatar user={item.friend} size="lg" />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>{item.friend.first_name} {item.friend.last_name || ''}</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: item.net_balance > 0 ? '#34d399' : '#f87171' }}>
                                        {item.net_balance > 0
                                            ? `Owes you ₹${item.net_balance.toFixed(2)}`
                                            : `You owe ₹${Math.abs(item.net_balance).toFixed(2)}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/groups')}
                                className="btn"
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    fontSize: '0.9rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                {item.net_balance < 0 ? 'Settle Up' : 'View Details'}
                            </button>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <p>No active debts! You're all settled up. ✨</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
