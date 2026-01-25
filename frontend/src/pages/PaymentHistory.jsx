import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { Clock, ArrowUp, ArrowDown, Filter } from 'lucide-react';

export default function PaymentHistory() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState('-date');

    const fetchHistory = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/history/${user.id}/?ordering=${ordering}`);
            setTransactions(res.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user, ordering]);

    const formatRate = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt);

    const getYourShare = (transaction) => {
        if (!transaction.splits) return 0;
        const yourSplit = transaction.splits.find(s => s.user.id === user?.id);
        return yourSplit ? yourSplit.amount_owed : 0;
    };

    const [expandedRows, setExpandedRows] = useState([]);

    const toggleRow = (id) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Transaction History</h1>

                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setOrdering('-date')}
                        style={{
                            padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: ordering === '-date' ? 'var(--primary)' : 'transparent',
                            color: ordering === '-date' ? 'white' : 'var(--text-muted)'
                        }}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => setOrdering('date')}
                        style={{
                            padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: ordering === 'date' ? 'var(--primary)' : 'transparent',
                            color: ordering === 'date' ? 'white' : 'var(--text-muted)'
                        }}
                    >
                        Oldest
                    </button>
                    <button
                        onClick={() => setOrdering('-amount')}
                        style={{
                            padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: ordering === '-amount' ? 'var(--primary)' : 'transparent',
                            color: ordering === '-amount' ? 'white' : 'var(--text-muted)'
                        }}
                    >
                        Highest
                    </button>
                    <button
                        onClick={() => setOrdering('amount')}
                        style={{
                            padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: ordering === 'amount' ? 'var(--primary)' : 'transparent',
                            color: ordering === 'amount' ? 'white' : 'var(--text-muted)'
                        }}
                    >
                        Lowest
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Details</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Payer</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Date</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Total Amount</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Your Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div className="spinner"></div>
                                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading records...</p>
                                </td></tr>
                            ) : transactions.map(tx => {
                                const yourShare = tx.type === 'expense' ? getYourShare(tx) : 0;
                                const isPayer = tx.payer === user?.id;
                                const isExpanded = expandedRows.includes(tx.id);

                                return (
                                    <React.Fragment key={tx.id}>
                                        <tr
                                            onClick={() => tx.type === 'expense' && toggleRow(tx.id)}
                                            style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                transition: 'background 0.2s',
                                                cursor: tx.type === 'expense' ? 'pointer' : 'default'
                                            }}
                                            className={tx.type === 'expense' ? "table-row-hover" : ""}
                                        >
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px',
                                                        borderRadius: '8px',
                                                        background: tx.type === 'expense' ? 'rgba(99, 102, 241, 0.1)' : (tx.is_receiving ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {tx.type === 'expense' ? <Clock size={16} color="var(--primary)" /> : (tx.is_receiving ? <ArrowDown size={16} color="#34d399" /> : <ArrowUp size={16} color="#f87171" />)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>
                                                            {tx.type === 'expense' ? tx.description : (tx.is_receiving ? 'Payment Received' : 'Payment Made')}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>{tx.group_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                {tx.type === 'expense' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <Avatar user={tx.payer_details} size="xs" />
                                                        <span style={{ fontSize: '0.9rem' }}>{isPayer ? 'You' : tx.payer_name}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {tx.is_receiving ? `From ${tx.from_user}` : `To ${tx.to_user}`}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '1.25rem', fontWeight: 600 }}>
                                                ₹{parseFloat(tx.amount).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                                    <div style={{ textAlign: 'right', flex: 1 }}>
                                                        <span style={{
                                                            fontWeight: 700,
                                                            color: tx.type === 'expense' ? (isPayer ? '#34d399' : '#f87171') : (tx.is_receiving ? '#34d399' : '#f87171'),
                                                            fontSize: '1rem',
                                                            display: 'block'
                                                        }}>
                                                            {tx.type === 'expense' ? (isPayer ? '+' : '-') : (tx.is_receiving ? '+' : '-')}₹{parseFloat(tx.type === 'expense' ? yourShare : tx.amount).toFixed(2)}
                                                        </span>
                                                        {tx.type === 'expense' && !isPayer && (
                                                            <span style={{ fontSize: '0.7rem', color: tx.splits?.find(s => s.user.id === user?.id)?.is_settled ? '#34d399' : '#f87171', fontWeight: 600 }}>
                                                                {tx.splits?.find(s => s.user.id === user?.id)?.is_settled ? 'SETTLED' : 'UNPAID'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {tx.type === 'expense' && !isPayer && !tx.splits?.find(s => s.user.id === user?.id)?.is_settled && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const split = tx.splits.find(s => s.user.id === user?.id);
                                                                    if (split) {
                                                                        axios.post(`${API_BASE_URL}/splits/${split.id}/settle/`)
                                                                            .then(() => fetchHistory())
                                                                            .catch(err => console.error(err));
                                                                    }
                                                                }}
                                                                className="btn"
                                                                style={{
                                                                    padding: '0.35rem 0.75rem',
                                                                    fontSize: '0.75rem',
                                                                    background: 'var(--primary)',
                                                                    color: 'white',
                                                                    borderRadius: '8px'
                                                                }}
                                                            >
                                                                Settle
                                                            </button>
                                                        )}
                                                        {tx.type === 'expense' && <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.5 }}>▼</span>}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && tx.type === 'expense' && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                                                    <div className="animate-slide-down" style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Split Details</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                            {tx.splits.map(split => (
                                                                <div key={split.user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                        <Avatar user={split.user} size="xs" />
                                                                        <span style={{ fontSize: '0.95rem' }}>
                                                                            {split.user.id === user?.id ? 'You' : (split.user.first_name ? `${split.user.first_name} ${split.user.last_name || ''}` : split.user.email)}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                        <span style={{ fontWeight: 600 }}>₹{parseFloat(split.amount_owed).toFixed(2)}</span>
                                                                        <span style={{
                                                                            fontSize: '0.75rem',
                                                                            padding: '2px 8px',
                                                                            borderRadius: '10px',
                                                                            background: split.is_settled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                            color: split.is_settled ? '#34d399' : '#f87171',
                                                                            border: `1px solid ${split.is_settled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                                                        }}>
                                                                            {split.is_settled ? 'Settled' : 'Unpaid'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {!loading && transactions.length === 0 && (
                                <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ opacity: 0.5, marginBottom: '1rem' }}>📭</div>
                                    <p>No transactions yet. Start splitting expenses!</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
