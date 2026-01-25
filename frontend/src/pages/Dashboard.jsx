import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { API_BASE_URL } from '../api/config';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [balance, setBalance] = useState({ you_owe: 0, owed_to_you: 0 });
    const [usageData, setUsageData] = useState([]);
    const [breakdown, setBreakdown] = useState([]);
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [settleTarget, setSettleTarget] = useState(null);

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

    const handleSettleSubmit = async () => {
        if (!settleTarget) return;
        const { friendId, isReceiving } = settleTarget;

        try {
            await axios.post(`${API_BASE_URL}/settle/`, {
                user_id: isReceiving ? friendId : user.id,
                friend_id: isReceiving ? user.id : friendId
            });
            // Refresh data
            const balRes = await axios.get(`${API_BASE_URL}/balance/${user.id}/`);
            setBalance({
                you_owe: balRes.data.you_owe,
                owed_to_you: balRes.data.owed_to_you
            });
            const breakRes = await axios.get(`${API_BASE_URL}/balance/breakdown/${user.id}/`);
            setBreakdown(breakRes.data);
            const useRes = await axios.get(`${API_BASE_URL}/usage/${user.id}/`);
            setUsageData(useRes.data);
            setShowSettleModal(false);
        } catch (error) {
            console.error("Failed to settle debt", error);
            alert("Failed to settle debt. Please try again.");
        }
    };

    const openSettleModal = (friendId, isReceiving) => {
        setSettleTarget({ friendId, isReceiving });
        setShowSettleModal(true);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Settle Confirmation Modal */}
            {showSettleModal && settleTarget && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
                    zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card animate-pop-in" style={{ width: '420px', maxWidth: '90%', textAlign: 'center', padding: '2.5rem' }}>
                        <div style={{
                            width: '80px', height: '80px', background: settleTarget.isReceiving ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
                        }}>
                            {settleTarget.isReceiving ? (
                                <CheckCircle2 size={40} color="#10b981" />
                            ) : (
                                <AlertCircle size={40} color="#818cf8" />
                            )}
                        </div>
                        <h2 style={{ marginTop: 0, fontSize: '1.5rem' }}>
                            {settleTarget.isReceiving ? 'Payment Received?' : 'Settle Up?'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                            {settleTarget.isReceiving
                                ? "Confirm that your friend has paid you. This will record a receipt in your history."
                                : "Mark your debt as settled. This will record a manual payment in your history."}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowSettleModal(false)}
                                className="btn"
                                style={{ background: 'rgba(255,255,255,0.05)', flex: 1, border: '1px solid var(--border)', height: '48px' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSettleSubmit}
                                className="btn"
                                style={{
                                    background: settleTarget.isReceiving ? '#10b981' : 'var(--primary)',
                                    color: 'white', flex: 1, height: '48px', fontWeight: 600
                                }}
                            >
                                {settleTarget.isReceiving ? 'Correct, Paid Me' : 'Yes, Settled'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {/* Balance Cards */}
                <div className="card animate-slide-up delay-1" style={{ borderTop: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Total You Owe</p>
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
                            <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Total Owed to You</p>
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
                            <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Overall Net Balance</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: isPositive ? '#818cf8' : '#f87171' }}>
                                {isPositive ? '+' : '-'}₹{Math.abs(totalBalance).toFixed(2)}
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

            {/* Friends Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                {/* Money You Owe */}
                <div className="card animate-slide-up delay-3">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#f87171' }}>People You Owe</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {breakdown.filter(item => item.net_balance < 0).length > 0 ? (
                            breakdown.filter(item => item.net_balance < 0).map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                                    border: '1px solid rgba(239, 68, 68, 0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Avatar user={item.friend} size="md" />
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{item.friend.first_name} {item.friend.last_name || ''}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#f87171' }}>You owe ₹{Math.abs(item.net_balance).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openSettleModal(item.friend.id, false)}
                                        className="btn"
                                        style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                    >
                                        Settle Up
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No pending debts! 🎉</p>
                        )}
                    </div>
                </div>

                {/* Money Owed to You */}
                <div className="card animate-slide-up delay-3">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#34d399' }}>People Who Owe You</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {breakdown.filter(item => item.net_balance > 0).length > 0 ? (
                            breakdown.filter(item => item.net_balance > 0).map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                                    border: '1px solid rgba(16, 185, 129, 0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Avatar user={item.friend} size="md" />
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{item.friend.first_name} {item.friend.last_name || ''}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#34d399' }}>Owes you ₹{item.net_balance.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openSettleModal(item.friend.id, true)}
                                        className="btn"
                                        style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                    >
                                        Paid Me
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No one owes you money. 🤝</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
