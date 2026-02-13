import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { UserPlus, CheckCircle, ChevronDown } from 'lucide-react'

export default function Registration() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        class_name: '',
        cabinet_id: ''
    })
    const [cabinets, setCabinets] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [alertModal, setAlertModal] = useState({ open: false, message: '', type: 'error' })
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

    useEffect(() => {
        fetchCabinetsAndCounts()
    }, [])

    async function fetchCabinetsAndCounts() {
        try {
            // Get cabinets
            const { data: cabinetsData, error: cabError } = await supabase
                .from('cabinets')
                .select('*')
                .order('name')

            if (cabError) throw cabError

            // Get student counts per cabinet
            // We can't easily do a join with count in one go without a view, so we'll fetch all students (or use a stored procedure, but simple fetch is fine for MVP)
            // Actually, let's just fetch all students to count them. Optimally we'd use .select('cabinet_id', { count: 'exact' }) but that groups poorly.
            // Let's rely on client side counting for this prototype size.
            const { data: studentsData, error: stuError } = await supabase
                .from('students')
                .select('cabinet_id')

            if (stuError) throw stuError

            const counts = {}
            studentsData.forEach(s => {
                counts[s.cabinet_id] = (counts[s.cabinet_id] || 0) + 1
            })

            const availableCabinets = cabinetsData.map(c => ({
                ...c,
                current_count: counts[c.id] || 0,
                is_full: (counts[c.id] || 0) >= c.capacity
            }))

            setCabinets(availableCabinets)
        } catch (error) {
            setAlertModal({ open: true, message: 'Error loading cabinets: ' + error.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)

        try {
            // Re-check capacity before inserting
            const { count, error: countError } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('cabinet_id', formData.cabinet_id)

            if (countError) throw countError

            const selectedCabinet = cabinets.find(c => c.id === formData.cabinet_id)
            if (count >= selectedCabinet.capacity) {
                setAlertModal({ open: true, message: 'This cabinet is full! Please select another one.', type: 'error' })
                fetchCabinetsAndCounts() // Refresh to show updated status
                return
            }

            const { error } = await supabase
                .from('students')
                .insert([formData])

            if (error) throw error

            setSuccess(true)
            setFormData({
                first_name: '',
                last_name: '',
                phone: '',
                class_name: '',
                cabinet_id: ''
            })
            fetchCabinetsAndCounts() // Refresh counts
        } catch (error) {
            setAlertModal({ open: true, message: 'Registration failed: ' + error.message, type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ color: '#10b981', marginBottom: '1rem' }}>
                    <CheckCircle size={64} />
                </div>
                <h2>Registration Successful!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    The student has been registered and assigned to the cabinet.
                </p>
                <button className="btn btn-primary" onClick={() => setSuccess(false)}>
                    Register Another Student
                </button>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Student Registration</h2>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label>First Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.first_name}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Last Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.last_name}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label>Class (e.g., 9-A)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.class_name}
                                onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                className="input-field"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+998..."
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label>Select Cabinet</label>
                        <div className="custom-dropdown-container" style={{ position: 'relative' }}>
                            <div
                                className="input-field"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 0
                                }}
                            >
                                <span style={{ color: formData.cabinet_id ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    {formData.cabinet_id
                                        ? (() => {
                                            const c = cabinets.find(cab => cab.id === formData.cabinet_id)
                                            return c ? `${c.name} (${c.current_count}/${c.capacity})` : 'Selected Room'
                                        })()
                                        : '-- Choose a Room --'}
                                </span>
                                <ChevronDown size={20} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--text-muted)' }} />
                            </div>

                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '110%',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius)',
                                    boxShadow: 'var(--shadow)',
                                    zIndex: 100,
                                    maxHeight: '250px',
                                    overflowY: 'auto',
                                    animation: 'fadeIn 0.2s ease-out'
                                }}>
                                    {cabinets.map(cab => (
                                        <div
                                            key={cab.id}
                                            onClick={() => {
                                                if (!cab.is_full) {
                                                    setFormData({ ...formData, cabinet_id: cab.id })
                                                    setIsDropdownOpen(false)
                                                }
                                            }}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                cursor: cab.is_full ? 'not-allowed' : 'pointer',
                                                background: formData.cabinet_id === cab.id ? 'var(--bg-secondary)' : 'transparent',
                                                borderBottom: '1px solid var(--glass-border)',
                                                opacity: cab.is_full ? 0.6 : 1,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!cab.is_full) e.currentTarget.style.background = 'var(--bg-secondary)'
                                            }}
                                            onMouseLeave={(e) => {
                                                if (formData.cabinet_id !== cab.id) e.currentTarget.style.background = 'transparent'
                                            }}
                                        >
                                            <span style={{ fontWeight: 500 }}>{cab.name}</span>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: cab.is_full ? '#ef444420' : '#10b98120',
                                                color: cab.is_full ? '#ef4444' : '#10b981'
                                            }}>
                                                {cab.current_count}/{cab.capacity} {cab.is_full ? 'FULL' : 'Open'}
                                            </span>
                                        </div>
                                    ))}
                                    {cabinets.length === 0 && (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No rooms available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={submitting}
                    >
                        {submitting ? 'Registering...' : 'Register Student'}
                    </button>
                </form>
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
