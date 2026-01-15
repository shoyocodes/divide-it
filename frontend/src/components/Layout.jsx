import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Avatar from './Avatar';

const NavItem = ({ to, icon, label, active }) => (
    <Link
        to={to}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: active ? '#fff' : 'var(--text-muted)',
            background: active ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
            marginBottom: '0.5rem',
            transition: 'all 0.2s',
            fontWeight: 500
        }}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);

const CreditCardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);

const ListIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);

const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const Header = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <header style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: location.pathname === '/' ? '3rem 2rem' : '1.5rem 2rem',
            marginBottom: location.pathname === '/' ? '1rem' : '0'
        }}>
            <div style={{ paddingTop: '40px' }} className="animate-slide-right">
                {location.pathname === '/' && (
                    <>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.75rem',
                            fontWeight: 600,
                            background: 'linear-gradient(to right, #ffffff, rgba(196, 181, 253, 0.7))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            display: 'inline-block'
                        }}>
                            {getGreeting()}, {user?.first_name || 'User'}!
                        </h2>
                        <p style={{ margin: '16px 0 0 0', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 400 }}>Welcome back to Divide It.</p>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', marginTop: '5px' }}>
                <div style={{ position: 'relative' }}>
                    <div onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <Avatar user={user} size="lg" style={{ cursor: 'pointer' }} />
                    </div>

                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '60px',
                            right: '0',
                            width: '200px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                            zIndex: 100,
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #334155', marginBottom: '0.5rem' }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{user?.username || 'User'}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email}</p>
                            </div>
                            <Link
                                to="/profile"
                                onClick={() => setDropdownOpen(false)}
                                style={{ display: 'block', padding: '0.75rem 1rem', color: '#e2e8f0', textDecoration: 'none', borderRadius: '8px', fontSize: '0.9rem', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.target.style.background = '#334155'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                Profile Settings
                            </Link>
                            <div
                                onClick={logout}
                                style={{ padding: '0.75rem 1rem', color: '#f87171', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', marginTop: '0.2rem', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default function Layout() {
    const location = useLocation();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
            {/* Sidebar */}
            <div style={{
                width: '260px',
                borderRight: '1px solid var(--border)',
                background: 'rgba(15, 23, 42, 0.3)',
                backdropFilter: 'blur(10px)',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50
            }}>
                <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
                    <h2 className="logo" style={{ fontSize: '1.5rem', margin: 0 }}>Divide It</h2>
                </div>

                <nav>
                    <NavItem to="/" icon={<HomeIcon />} label="Dashboard" active={location.pathname === '/'} />
                    <NavItem to="/groups" icon={<ListIcon />} label="My Groups" active={location.pathname === '/groups'} />
                    <NavItem to="/history" icon={<ListIcon />} label="Activity" active={location.pathname === '/history'} />
                    <NavItem to="/about" icon={<InfoIcon />} label="About" active={location.pathname === '/about'} />
                </nav>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: '260px' }}>
                <Header />
                <main style={{ padding: '2rem' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
