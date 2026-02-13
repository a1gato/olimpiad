import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Search, Trash2 } from 'lucide-react'

export default function StudentList() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [cabinets, setCabinets] = useState({})

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null })
    const [alertModal, setAlertModal] = useState({ open: false, message: '', type: 'error' })

    useEffect(() => {
        fetchStudents()
    }, [])

    async function fetchStudents() {
        try {
            // Fetch students
            const { data: studentsData, error: stuError } = await supabase
                .from('students')
                .select('*')
                .order('created_at', { ascending: false })

            if (stuError) throw stuError

            // Fetch cabinets for mapping names
            const { data: cabinetsData, error: cabError } = await supabase
                .from('cabinets')
                .select('id, name')

            if (cabError) throw cabError

            const cabMap = {}
            cabinetsData.forEach(c => cabMap[c.id] = c.name)
            setCabinets(cabMap)

            setStudents(studentsData)
        } catch (error) {
            console.error('Error fetching students:', error)
            setAlertModal({ open: true, message: 'Error fetching students: ' + error.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    function confirmDelete(id) {
        setDeleteModal({ open: true, id })
    }

    async function executeDelete() {
        const id = deleteModal.id
        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', id)

            if (error) throw error

            setStudents(students.filter(s => s.id !== id))
        } catch (error) {
            setAlertModal({ open: true, message: 'Error deleting student: ' + error.message, type: 'error' })
        } finally {
            setDeleteModal({ open: false, id: null })
        }
    }

    const filteredStudents = students.filter(student =>
        (student.first_name + ' ' + student.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Student List</h2>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="input-field"
                        style={{ paddingLeft: '3rem', width: '300px', marginBottom: 0 }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Class</th>
                            <th style={{ padding: '1rem' }}>Phone</th>
                            <th style={{ padding: '1rem' }}>Cabinet</th>
                            <th style={{ padding: '1rem' }}>Score</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{student.first_name} {student.last_name}</td>
                                <td style={{ padding: '1rem' }}>{student.class_name}</td>
                                <td style={{ padding: '1rem' }}>{student.phone}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: 'var(--bg-secondary)',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        {cabinets[student.cabinet_id] || 'Unknown'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {student.score !== null ? (
                                        <span style={{ fontWeight: 'bold', color: student.score >= 50 ? '#10b981' : '#f59e0b' }}>
                                            {student.score}
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => confirmDelete(student.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                                        title="Delete Student"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {loading ? 'Loading students...' : 'No students found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
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
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '400px', maxWidth: '90%', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Delete Student?</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                            Are you sure you want to delete this student?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                                onClick={() => setDeleteModal({ open: false, id: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{ background: '#ef4444', color: 'white' }}
                                onClick={executeDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
