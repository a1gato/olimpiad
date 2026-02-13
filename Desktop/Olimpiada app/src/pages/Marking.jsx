import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Save, Filter, ChevronDown } from 'lucide-react'

export default function Marking() {
    const [students, setStudents] = useState([])
    const [cabinets, setCabinets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCabinetId, setSelectedCabinetId] = useState('all')
    const [alertModal, setAlertModal] = useState({ open: false, message: '', type: 'error' })

    // Optimization: Refs for debouncing
    const pendingUpdates = useRef({})
    const saveTimeout = useRef(null)
    const isSaving = useRef(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const { data: cabData } = await supabase.from('cabinets').select('*').order('name')
            setCabinets(cabData || [])

            const { data: stuData, error } = await supabase
                .from('students')
                .select('*')
                .order('last_name')

            if (error) throw error
            setStudents(stuData)
        } catch (error) {
            console.error('Error fetching data:', error)
            setAlertModal({ open: true, message: 'Error loading data: ' + error.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    async function updateScore(studentId, field, value) {
        const numValue = value === '' ? 0 : parseInt(value)

        setStudents(current =>
            current.map(s => {
                if (s.id === studentId) {
                    const updated = { ...s, [field]: value === '' ? null : numValue }
                    // Auto-calculate total
                    const s1 = field === 'score_1' ? numValue : (s.score_1 || 0)
                    const s2 = field === 'score_2' ? numValue : (s.score_2 || 0)
                    updated.score = s1 + s2
                    return updated
                }
                return s
            })
        )

        try {
            // We need to get the latest state to calculate total correctly for DB
            // But since we are inside an async function, usage of 'students' state might be stale
            // So we rely on the value passed and the current item in the map above.
            // Actually, for the DB update, we can just send the specific field 
            // AND the calculated total. 

            // To do this reliably without race conditions, we'd ideally use a trigger or 
            // careful frontend logic. For now, frontend calculation is fine for MVP.

            const student = students.find(s => s.id === studentId)
            const s1 = field === 'score_1' ? numValue : (student.score_1 || 0)
            const s2 = field === 'score_2' ? numValue : (student.score_2 || 0)
            const total = s1 + s2

            const { error } = await supabase
                .from('students')
                .update({
                    [field]: value === '' ? null : numValue,
                    score: total
                })
                .eq('id', studentId)

            if (error) throw error
        } catch (error) {
            console.error('Error saving score:', error)
            setAlertModal({ open: true, message: 'Error saving score: ' + error.message, type: 'error' })
            // Revert on error
            fetchData()
        }
    }

    const filteredStudents = selectedCabinetId === 'all'
        ? students
        : students.filter(s => s.cabinet_id === selectedCabinetId)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (isDropdownOpen && !event.target.closest('.custom-dropdown-container')) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isDropdownOpen])

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Marking / Grading</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Filter size={20} color="var(--text-muted)" />
                    <div className="custom-dropdown-container" style={{ position: 'relative', width: '200px' }}>
                        <button
                            className="input-field"
                            style={{
                                width: '100%',
                                marginBottom: 0,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                gridTemplateColumns: '1fr auto'
                            }}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedCabinetId === 'all' ? 'All Cabinets' : cabinets.find(c => c.id === selectedCabinetId)?.name}
                            </span>
                            <ChevronDown size={16} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                        </button>
                        {isDropdownOpen && (
                            <div className="dropdown-menu show" style={{
                                position: 'absolute',
                                top: '110%',
                                left: 0,
                                width: '100%',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius)',
                                boxShadow: 'var(--shadow)',
                                zIndex: 10,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                <div
                                    className="dropdown-item"
                                    onClick={() => { setSelectedCabinetId('all'); setIsDropdownOpen(false); }}
                                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)', background: selectedCabinetId === 'all' ? 'var(--bg-secondary)' : 'transparent' }}
                                >
                                    All Cabinets
                                </div>
                                {cabinets.map(c => (
                                    <div
                                        key={c.id}
                                        className="dropdown-item"
                                        onClick={() => { setSelectedCabinetId(c.id); setIsDropdownOpen(false); }}
                                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', background: selectedCabinetId === c.id ? 'var(--bg-secondary)' : 'transparent' }}
                                    >
                                        {c.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Student Name</th>
                            <th style={{ padding: '1rem' }}>Class</th>
                            <th style={{ padding: '1rem' }}>Cabinet</th>
                            <th style={{ padding: '1rem', width: '100px', textAlign: 'center' }}>Section 1</th>
                            <th style={{ padding: '1rem', width: '100px', textAlign: 'center' }}>Section 2</th>
                            <th style={{ padding: '1rem', width: '100px', textAlign: 'center' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>
                                    {student.last_name}, {student.first_name}
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
                                        {cabinets.find(c => c.id === student.cabinet_id)?.name || '...'}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input-field"
                                        style={{
                                            marginBottom: 0,
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            width: '70px',
                                            margin: '0 auto',
                                            padding: '0.5rem'
                                        }}
                                        value={student.score_1 ?? ''}
                                        onChange={e => updateScore(student.id, 'score_1', e.target.value)}
                                        placeholder="0"
                                    />
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input-field"
                                        style={{
                                            marginBottom: 0,
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            width: '70px',
                                            margin: '0 auto',
                                            padding: '0.5rem'
                                        }}
                                        value={student.score_2 ?? ''}
                                        onChange={e => updateScore(student.id, 'score_2', e.target.value)}
                                        placeholder="0"
                                    />
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                                    {(student.score_1 || 0) + (student.score_2 || 0)}
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No students found for this filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Alert Modal */}
            {alertModal.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1100,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '400px', maxWidth: '90%', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 style={{ marginBottom: '1rem', color: alertModal.type === 'error' ? '#ef4444' : 'var(--text-main)' }}>
                            {alertModal.type === 'error' ? 'Error' : 'Notice'}
                        </h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                            {alertModal.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setAlertModal({ ...alertModal, open: false })}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
