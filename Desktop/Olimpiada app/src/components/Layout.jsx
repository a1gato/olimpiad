import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UserPlus, Settings, School, Users, BookOpen, Trophy } from 'lucide-react'

export default function Layout({ children }) {
    const location = useLocation()
    const navigate = useNavigate()

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/students', label: 'Student List', icon: Users },
        { path: '/marking', label: 'Marking', icon: BookOpen },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { path: '/cabinets', label: 'Cabinets', icon: Settings },
        { path: '/register', label: 'Registration', icon: UserPlus },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--glass-bg)',
                borderRight: '1px solid var(--glass-border)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>
                    <img src="/logo.png" alt="Olympiad Logo" style={{ height: '120px' }} />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius)',
                                    color: isActive ? 'white' : 'var(--text-muted)',
                                    background: isActive ? 'var(--primary)' : 'transparent',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ height: '1rem' }}></div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}

