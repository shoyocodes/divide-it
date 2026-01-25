import { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/history/?ordering=${ordering}`);
                setTransactions(res.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [ordering]);

    const formatRate = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt);

    const getYourShare = (transaction) => {
        if (transaction.payer === user?.id) {
            // You paid this. Your share is total minus what others owe.
            // Or more simply, find your split.
            const yourSplit = transaction.splits.find(s => s.user.id === user?.id);
            return yourSplit ? yourSplit.amount_owed : 0;
        } else {
            const yourSplit = transaction.splits.find(s => s.user.id === user?.id);
            return yourSplit ? yourSplit.amount_owed : 0;
        }
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
                                const yourShare = getYourShare(tx);
                                const isPayer = tx.payer === user?.id;

                                return (
                                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-row-hover">
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: 600 }}>{tx.description}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expense ID: #{tx.id}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Avatar user={tx.payer_details} size="xs" />
                                                <span style={{ fontSize: '0.9rem' }}>{isPayer ? 'You' : tx.payer_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '1.25rem', fontWeight: 600 }}>
                                            ₹{parseFloat(tx.amount).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: isPayer ? '#34d399' : '#f87171',
                                                fontSize: '1rem'
                                            }}>
                                                {isPayer ? '+' : '-'}₹{parseFloat(yourShare).toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
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
