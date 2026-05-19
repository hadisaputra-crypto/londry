import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

export default function Members() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const homeRoute = user?.role === 'kasir' ? '/cashier-dashboard' : '/laundry-dashboard'
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    nomor_hp: '',
    alamat: '',
    poin: 0
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/members')
      setMembers(data)
    } catch (error) {
      console.error('Gagal mengambil data member:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const openModal = (member = null) => {
    if (member) {
      setEditingId(member.id)
      setFormData({
        nama: member.nama,
        nomor_hp: member.nomor_hp || '',
        alamat: member.alamat || '',
        poin: member.poin
      })
    } else {
      setEditingId(null)
      setFormData({
        nama: '',
        nomor_hp: '',
        alamat: '',
        poin: 0
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/members/${editingId}`, formData)
      } else {
        await api.post('/members', formData)
      }
      await fetchMembers()
      closeModal()
    } catch (error) {
      console.error('Gagal menyimpan member:', error)
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.'
      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus member ini?')) {
      try {
        await api.delete(`/members/${id}`)
        await fetchMembers()
      } catch (error) {
        console.error('Gagal menghapus member:', error)
        alert('Gagal menghapus data member.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#409b4f] text-white shadow-md">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <button 
            onClick={() => navigate(homeRoute)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Manajemen Member</h1>
            <p className="text-[10px] text-white/80 font-bold leading-none mt-0.5 uppercase tracking-wider">
              {user?.nama_laundry || 'LaundryKu'}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <button
          onClick={() => openModal()}
          className="w-full bg-[#409b4f] text-white font-semibold py-3.5 rounded-xl shadow-[0_4px_12px_rgba(64,155,79,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Tambah Member Baru
        </button>

        {loading ? (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-[#409b4f]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-100 shadow-sm">
            Belum ada data member.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="bg-white p-4 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {member.nama}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                    {member.nomor_hp && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {member.nomor_hp}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 font-semibold text-[#f48425] mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      {member.poin} Poin
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openModal(member)} className="p-2 text-slate-400 hover:text-green-600 bg-slate-50 rounded-lg active:bg-slate-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg active:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal Form ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white rounded-2xl w-full max-w-md p-5 z-10 shadow-xl transform transition-all animate-[slideUp_0.2s_ease]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Member' : 'Member Baru'}</h2>
              <button onClick={closeModal} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama"
                  required
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Misal: Budi Santoso"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#409b4f]/20 focus:border-[#409b4f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor HP / WhatsApp</label>
                <input
                  type="text"
                  name="nomor_hp"
                  value={formData.nomor_hp}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#409b4f]/20 focus:border-[#409b4f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  placeholder="Alamat lengkap member..."
                  rows="2"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#409b4f]/20 focus:border-[#409b4f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jumlah Poin Awal</label>
                <input
                  type="number"
                  name="poin"
                  required
                  min="0"
                  value={formData.poin}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#409b4f]/20 focus:border-[#409b4f]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#409b4f] text-white font-semibold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-transform disabled:opacity-70 mt-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
