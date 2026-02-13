import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Trash2, Plus, Building } from 'lucide-react'

export default function Cabinets() {
    const [cabinets, setCabinets] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCabinet, setNewCabinet] = useState({ name: '', capacity: 30 })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [alertModal, setAlertModal] = useState({ open: false, message: '', type: 'error' })

    useEffect(() => {
        fetchCabinets()
    }, [])

    async function fetchCabinets() {
        try {
            const { data, error } = await supabase
                .from('cabinets')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            setCabinets(data)
        } catch (error) {
            setAlertModal({ open: true, message: 'Error loading cabinets: ' + error.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    async function addCabinet(e) {
        e.preventDefault()
        if (!newCabinet.name) return

        try {
            const { error } = await supabase
                .from('cabinets')
                .insert([newCabinet])

            if (error) throw error

            setNewCabinet({ name: '', capacity: 30 })
            setIsModalOpen(false)
            fetchCabinets()
        } catch (error) {
            setAlertModal({ open: true, message: 'Error adding cabinet: ' + error.message, type: 'error' })
        }
    }

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null })

    function confirmDelete(id) {
        setDeleteModal({ open: true, id })
    }

    async function executeDelete() {
        const id = deleteModal.id
        try {
            const { error } = await supabase
                .from('cabinets')
                .delete()
                .eq('id', id)

            if (error) {
                if (error.code === '23503') { // Foreign key violation
                    setAlertModal({
                        open: true,
                        message: 'Cannot delete this room because students are assigned to it. Please move or delete the students first.',
                        type: 'error'
                    })
                } else {
                    throw error
                }
            } else {
                fetchCabinets()
            }
        } catch (error) {
            setAlertModal({ open: true, message: 'Error deleting cabinet: ' + error.message, type: 'error' })
        } finally {
            setDeleteModal({ open: false, id: null })
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Building size={32} color="var(--primary)" />
                    <h2 style={{ margin: 0 }}>Room List</h2>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={20} /> Add Room
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Room Name</th>
                            <th style={{ padding: '1rem' }}>Capacity</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center' }}>Loading...</td>
                            </tr>
                        ) : cabinets.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No rooms found.</td>
                            </tr>
                        ) : (
                            cabinets.map(cabinet => (
                                <tr key={cabinet.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{cabinet.name}</td>
                                    <td style={{ padding: '1rem' }}>{cabinet.capacity} students</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => confirmDelete(cabinet.id)}
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                borderRadius: '6px',
                                                transition: 'background 0.2s'
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
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
                        <h3 style={{ marginBottom: '1.5rem' }}>Add New Room</h3>
                        <form onSubmit={addCabinet}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Room Name / Number</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Room 101"
                                    value={newCabinet.name}
                                    onChange={e => setNewCabinet({ ...newCabinet, name: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label>Capacity</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    value={newCabinet.capacity}
                                    onChange={e => setNewCabinet({ ...newCabinet, capacity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                        <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Delete Room?</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                            Are you sure you want to delete this room? This action cannot be undone.
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
                                Delete Room
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
                    zIndex: 1100, // Higher than other modals
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
