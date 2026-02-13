import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Trophy, Medal } from 'lucide-react'

export default function Leaderboard() {
    const [students, setStudents] = useState([])
    const [cabinets, setCabinets] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    async function fetchLeaderboard() {
        try {
            // Fetch cabinets first for mapping
            const { data: cabData } = await supabase.from('cabinets').select('id, name')
            const cabMap = {}
            if (cabData) {
                cabData.forEach(c => cabMap[c.id] = c.name)
            }
            setCabinets(cabMap)

            const { data, error } = await supabase
                .from('students')
                .select('*')
                .not('score', 'is', null) // Only show scored students
                .order('score', { ascending: false })
                .limit(50) // Top 50

            if (error) throw error
            setStudents(data)
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
        } finally {
            setLoading(false)
        }
    }

    function getRankIcon(index) {
        if (index === 0) return <Trophy color="#eab308" fill="#fef08a" size={24} /> // Gold
        if (index === 1) return <Medal color="#94a3b8" fill="#f1f5f9" size={24} /> // Silver
        if (index === 2) return <Medal color="#f97316" fill="#ffedd5" size={24} /> // Bronze
        return <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-muted)', width: '24px', textAlign: 'center', display: 'inline-block' }}>{index + 1}</span>
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Trophy size={32} color="var(--primary)" />
                <h2 style={{ margin: 0 }}>Leaderboard</h2>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', width: '80px', textAlign: 'center' }}>Rank</th>
                            <th style={{ padding: '1rem' }}>Student Name</th>
                            <th style={{ padding: '1rem' }}>Class</th>
                            <th style={{ padding: '1rem' }}>Room</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student.id} style={{
                                borderBottom: '1px solid var(--glass-border)',
                                background: index < 3 ? 'rgba(79, 70, 229, 0.03)' : 'transparent'
                            }}>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        {getRankIcon(index)}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                                    {student.first_name} {student.last_name}
                                </td>
                                <td style={{ padding: '1rem' }}>{student.class_name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: 'var(--bg-secondary)',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        {cabinets[student.cabinet_id] || '...'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                                    {student.score}
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {loading ? 'Loading rankings...' : 'No scored students yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
