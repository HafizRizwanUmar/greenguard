import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, LogOut, Users, Leaf, Mail, PlusCircle } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = React.useState(false);

    const menuItems = [
        { icon: PlusCircle, label: 'New Analysis', path: '/dashboard' },
        { icon: History, label: 'History', path: '/history' },
        { icon: Leaf, label: 'News', path: '/news' },
        { icon: Mail, label: 'Contact', path: '/contact' },
    ];


    const [user, setUser] = React.useState({ name: 'User', email: 'user@example.com' });

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 right-4 z-[1002] lg:hidden p-2 bg-green-600 text-white rounded-lg shadow-lg"
            >
                {isOpen ? <LogOut size={24} className="rotate-180" /> : <LayoutDashboard size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[999] lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`gg-sidebar fixed left-0 top-0 h-screen w-[280px] flex flex-col z-[1000] shadow-2xl transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ borderRight: 'var(--glass-border)', background: 'var(--color-bg-sidebar)' }}>
                {/* Logo Section */}
                <div style={{ padding: '32px 24px', borderBottom: 'var(--glass-border)' }}>
                    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(5,150,105,0.4)'
                        }}>
                            <Leaf size={20} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>
                                <span style={{ color: 'var(--color-primary-dark)' }}>Green</span>
                                <span style={{ color: 'var(--color-primary)' }}>Guard</span>
                            </h1>
                            <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginTop: '4px', color: 'var(--color-text-muted)' }}>Forest Monitor</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '24px 0', overflowY: 'auto' }}>
                    <p style={{
                        padding: '0 24px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--color-text-muted)',
                        marginBottom: '16px'
                    }}>Menu</p>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`gg-nav-item ${isActive ? 'active' : ''}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <item.icon size={20} style={{ opacity: isActive ? 1 : 0.7 }} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div style={{ padding: '24px', borderTop: 'var(--glass-border)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'rgba(0,0,0,0.04)',
                        borderRadius: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: 'white'
                        }}>
                            {user.name && user.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--color-text-main)' }}>{user.name}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--color-text-muted)' }}>{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 500,
                            transition: 'all 0.2s ease'
                        }}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
};



export default Sidebar;
