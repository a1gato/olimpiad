import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Users, Search } from 'lucide-react'

export default function Dashboard() {
    const [cabinets, setCabinets] = useState([])
    const [selectedCabinet, setSelectedCabinet] = useState(null)
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()

        // Real-time subscription could be added here
        const subscription = supabase
            .channel('public:students')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, fetchDashboardData)
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    async function fetchDashboardData() {
        try {
            const { data: cabinetsData, error: cabError } = await supabase
                .from('cabinets')
                .select('*')
                .order('name')

            if (cabError) throw cabError

            // Fetch all students to count (and later filter for details)
            const { data: studentsData, error: stuError } = await supabase
                .from('students')
                .select('*')
                .order('created_at', { ascending: false })

            if (stuError) throw stuError

            // Map counts
            const counts = {}
            studentsData.forEach(s => {
                counts[s.cabinet_id] = (counts[s.cabinet_id] || 0) + 1
            })

            const dashboardData = cabinetsData.map(c => ({
                ...c,
                current_count: counts[c.id] || 0,
                occupancy: Math.round(((counts[c.id] || 0) / c.capacity) * 100)
            }))

            setCabinets(dashboardData)
            setStudents(studentsData) // Store all students to filter locally when cabinet selected
        } catch (error) {
            console.error('Error loading dashboard:', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Dashboard</h2>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {cabinets.map(cab => (
                    <div
                        key={cab.id}
                        className="card"
                        style={{ cursor: 'pointer', transition: 'transform 0.2s', borderColor: selectedCabinet?.id === cab.id ? 'var(--primary)' : 'var(--glass-border)' }}
                        onClick={() => setSelectedCabinet(cab)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{cab.name}</h3>
                            <div style={{
                                background: cab.occupancy >= 100 ? '#ef4444' : cab.occupancy > 80 ? '#f59e0b' : '#10b981',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: 'bold'
                            }}>
                                {cab.current_count} / {cab.capacity}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${Math.min(cab.occupancy, 100)}%`,
                                height: '100%',
                                background: cab.occupancy >= 100 ? '#ef4444' : 'var(--primary)',
                                transition: 'width 0.5s ease-out'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Student List for Selected Cabinet */}
            {selectedCabinet && (
                <div className="card animate-fade-in" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Students in {selectedCabinet.name}</h3>
                        <button className="btn" onClick={() => setSelectedCabinet(null)} style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)' }}>
                            Close
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Class</th>
                                    <th style={{ padding: '1rem' }}>Phone</th>
                                    <th style={{ padding: '1rem' }}>Registered At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students
                                    .filter(s => s.cabinet_id === selectedCabinet.id)
                                    .map(student => (
                                        <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1rem' }}>{student.first_name} {student.last_name}</td>
                                            <td style={{ padding: '1rem' }}>{student.class_name}</td>
                                            <td style={{ padding: '1rem' }}>{student.phone}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                                {new Date(student.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                {students.filter(s => s.cabinet_id === selectedCabinet.id).length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No students registered in this cabinet yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
