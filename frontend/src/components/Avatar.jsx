const AVATAR_COLORS = [
    '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#4ade80', '#fb7185'
];

const getAvatarColor = (name = 'User') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (user) => {
    if (!user) return 'U';
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    return user.email ? user.email[0].toUpperCase() : 'U';
};

export default function Avatar({ user, size = 'md', style = {} }) {
    const dimensions = {
        xxs: '16px',
        xs: '20px',
        sm: '24px',
        md: '32px',
        lg: '45px',
        xl: '64px'
    }[size] || size;

    const fontSize = {
        xxs: '0.5rem',
        xs: '0.6rem',
        sm: '0.7rem',
        md: '0.85rem',
        lg: '1rem',
        xl: '1.5rem'
    }[size] || '1rem';

    const displayName = user?.first_name || user?.username || user?.email || 'User';
    const color = getAvatarColor(displayName);

    if (user?.avatar_url) {
        return (
            <img
                src={user.avatar_url.startsWith('http') ? user.avatar_url : `/avatars/${user.avatar_url}.png`}
                alt={displayName}
                style={{
                    width: dimensions,
                    height: dimensions,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '2px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    ...style
                }}
            />
        );
    }

    return (
        <div style={{
            width: dimensions,
            height: dimensions,
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            color: '#fff',
            fontSize: fontSize,
            flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            ...style
        }}>
            {getInitials(user)}
        </div>
    );
}
