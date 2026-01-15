import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

export default function GroupsPage() {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // Expense States
    const [activeGroup, setActiveGroup] = useState(null); // Group being viewed
    const [activeGroupExpenses, setActiveGroupExpenses] = useState([]);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
    const [selectedMembers, setSelectedMembers] = useState([]); // Members included in the current split
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberName, setNewMemberName] = useState('');

    const getDisplayName = (u) => {
        if (!u) return 'Unknown';
        if (u.first_name || u.last_name) {
            return `${u.first_name || ''} ${u.last_name || ''}`.trim();
        }
        return u.username || u.email;
    };

    useEffect(() => {
        async function fetchGroups() {
            try {
                const res = await axios.get('http://localhost:8000/api/groups/');
                setGroups(res.data);
            } catch (error) {
                console.error("Failed to fetch groups");
            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, []);

    const fetchExpenses = async (groupId) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/expenses/?group_id=${groupId}`);
            setActiveGroupExpenses(res.data);
        } catch (error) {
            console.error("Failed to fetch expenses");
        }
    };

    const handleOpenGroup = async (group) => {
        setActiveGroup(group);
        setSelectedMembers(group.members.map(m => m.id)); // Default to all members
        await fetchExpenses(group.id);
        setShowExpenseModal(true);
    };

    const handleAddExpense = async () => {
        if (!newExpense.description || !newExpense.amount) {
            alert("Please enter a description and amount.");
            return;
        }

        if (selectedMembers.length === 0) {
            alert("Please select at least one person to split with.");
            return;
        }

        try {
            const payload = {
                description: newExpense.description,
                amount: parseFloat(newExpense.amount),
                group: activeGroup.id,
                payer: user?.id,
                participants: selectedMembers
            };
            console.log("Adding expense:", payload);
            await axios.post('http://localhost:8000/api/expenses/', payload);
            await fetchExpenses(activeGroup.id); // Refresh list
            setNewExpense({ description: '', amount: '' });
            alert("Expense added successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to add expense: " + (error.response?.data?.error || error.message));
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;

        try {
            const res = await axios.post('http://localhost:8000/api/groups/', {
                name: newGroupName,
                user_id: user?.id
            });
            setGroups([...groups, res.data]);
            setShowModal(false);
            setNewGroupName('');
        } catch (error) {
            console.error(error);
            alert("Failed to create group: " + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteGroup = (group) => {
        setGroupToDelete(group);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!groupToDelete) return;
        try {
            await axios.delete(`http://localhost:8000/api/groups/${groupToDelete.id}/`);
            setGroups(groups.filter(g => g.id !== groupToDelete.id));
            setShowDeleteModal(false);
            setGroupToDelete(null);
        } catch (error) {
            alert("Failed to delete group");
        }
    };

    const handleAddMember = async () => {
        if (!newMemberEmail.trim()) return;
        try {
            await axios.post(`http://localhost:8000/api/groups/${activeGroup.id}/add_member/`, {
                email: newMemberEmail,
                name: newMemberName
            });

            // Fetch updated group details
            const groupRes = await axios.get(`http://localhost:8000/api/groups/${activeGroup.id}/`);
            const updatedGroup = groupRes.data;

            setActiveGroup(updatedGroup);
            // Also update the groups list
            setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));

            // Auto-check the new member in the split list if they were just added
            // Find the member ID of the one we just added
            const addedMember = updatedGroup.members.find(m => m.email === newMemberEmail);
            if (addedMember && !selectedMembers.includes(addedMember.id)) {
                setSelectedMembers([...selectedMembers, addedMember.id]);
            }

            setNewMemberEmail('');
            setNewMemberName('');
        } catch (error) {
            alert(error.response?.data?.error || "Failed to add member");
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Groups</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Create Group</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {loading ? <p>Loading...</p> : groups.map(group => (
                    <div key={group.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ marginTop: 0 }}>{group.name}</h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group); }}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                title="Delete Group"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>{group.members.length} Members</p>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleOpenGroup(group)} className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>View Expenses</button>
                            <button onClick={() => handleOpenGroup(group)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Add Expense</button>
                        </div>
                    </div>
                ))}
                {!loading && groups.length === 0 && (
                    <div className="card" style={{ borderStyle: 'dashed', textAlign: 'center', opacity: 0.7 }}>
                        <p>No groups yet. Create one to start splitting!</p>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="card animate-pop-in" style={{ width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Create New Group</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Give your squad a name.</p>

                        <div className="input-group">
                            <label className="label">Group Name</label>
                            <input
                                autoFocus
                                type="text"
                                className="input"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="E.g. Summer Trip 🌴"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn"
                                style={{ background: 'transparent', color: 'var(--text-muted)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                className="btn btn-primary"
                                disabled={!newGroupName.trim()}
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense Management Modal */}
            {showExpenseModal && activeGroup && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card animate-pop-in" style={{ width: '800px', maxWidth: '95%', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: 0 }}>{activeGroup.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0.5rem 0 1rem 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {activeGroup.members.map((m, i) => (
                                            <Avatar
                                                key={m.id}
                                                user={m}
                                                size="xs"
                                                style={{
                                                    marginLeft: i === 0 ? 0 : '-8px',
                                                    border: '2px solid #1e293b',
                                                    position: 'relative',
                                                    zIndex: activeGroup.members.length - i
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                                        {activeGroup.members.length} members
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                        type="text"
                                        placeholder="Friend's Name"
                                        className="input"
                                        style={{ height: '36px', fontSize: '0.85rem', width: '150px', background: 'rgba(255,255,255,0.05)' }}
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="input"
                                        style={{ height: '36px', fontSize: '0.85rem', width: '200px', background: 'rgba(255,255,255,0.05)' }}
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                                    />
                                    <button onClick={handleAddMember} className="btn" style={{ padding: '0 1rem', height: '36px', fontSize: '0.8rem', background: 'var(--primary)', color: 'white' }}>
                                        + Add Person
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setShowExpenseModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', alignSelf: 'flex-start' }}>&times;</button>
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                            {/* Left: Expense List */}
                            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
                                <h3 style={{ marginTop: 0 }}>Expenses</h3>
                                {activeGroupExpenses.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>No expenses yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {activeGroupExpenses.map(exp => (
                                            <div key={exp.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 600 }}>{exp.description}</span>
                                                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{exp.amount}</span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                        <Avatar user={exp.payer_details} size="xs" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }} />
                                                        <span>Paid by <strong>{exp.payer_name}</strong></span>
                                                    </div>
                                                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                        {exp.splits.map(split => (
                                                            <div key={split.user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <Avatar user={split.user} size="xs" style={{ width: '18px', height: '18px', fontSize: '0.55rem' }} />
                                                                    <span>{getDisplayName(split.user)} owes</span>
                                                                </div>
                                                                <span>₹{split.amount_owed}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Add Expense */}
                            <div style={{ width: '320px', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', overflowY: 'auto' }}>
                                <h3 style={{ marginTop: 0 }}>Add Expense</h3>
                                <div className="input-group">
                                    <label className="label">Description</label>
                                    <input
                                        type="text" className="input" placeholder="Dinner, Uber, etc."
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">Amount</label>
                                    <input
                                        type="number" className="input" placeholder="0.00"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    />
                                </div>

                                <div style={{ marginTop: '1.5rem' }}>
                                    <label className="label" style={{ marginBottom: '0.75rem', display: 'block' }}>Include in Split:</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                                        {activeGroup.members.map(member => (
                                            <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(member.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedMembers([...selectedMembers, member.id]);
                                                        } else {
                                                            setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                                                        }
                                                    }}
                                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                                />
                                                <Avatar user={member} size="sm" />
                                                <span style={{ flex: 1 }}>{getDisplayName(member)} {member.id === user?.id && <span style={{ opacity: 0.5 }}>(You)</span>}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleAddExpense} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', height: '50px' }}>
                                    Split Expense
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && groupToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card animate-pop-in" style={{ width: '400px', maxWidth: '90%', textAlign: 'center' }}>
                        <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <h2 style={{ marginTop: 0 }}>Delete Group?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Are you sure you want to delete <strong>{groupToDelete.name}</strong>? This action cannot be undone and all expense data will be lost.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn"
                                style={{ background: 'rgba(255,255,255,0.05)', flex: 1, border: '1px solid var(--border)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn"
                                style={{ background: '#ef4444', color: 'white', flex: 1 }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
