import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

export default function Employees() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  
  // State manajemen
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'kasir'
  })

  const firstName = user?.name?.split(' ')[0] || 'Admin'

  // Pastikan hanya Admin Laundry yang memiliki akses ke halaman ini
  const isAdmin = user?.role === 'admin_laundry'

  const fetchEmployees = async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const { data } = await api.get('/karyawan')
      setEmployees(data)
    } catch (error) {
      console.error('Gagal memuat daftar karyawan:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchEmployees()
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const openModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'kasir'
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/karyawan/register', formData)
      await fetchEmployees()
      closeModal()
    } catch (error) {
      console.error('Gagal mendaftarkan karyawan:', error)
      const msg = error.response?.data?.message || error.response?.data?.errors?.email?.[0] || 'Gagal mendaftarkan karyawan baru.'
      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin ingin mencabut hak akses & memecat ${name}?`)) {
      try {
        await api.delete(`/karyawan/${id}`)
        await fetchEmployees()
      } catch (error) {
        console.error('Gagal menghapus karyawan:', error)
        alert('Gagal mencabut hak akses karyawan.')
      }
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Akses Ditolak</h2>
          <p className="text-sm text-slate-500 mb-6">Halaman ini hanya dapat diakses oleh Admin Laundry utama.</p>
          <button 
            onClick={() => navigate('/laundry-dashboard')}
            className="w-full bg-[#1875c0] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#1564a4] active:scale-95 transition-all cursor-pointer"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28 font-sans">
      
      {/* ── Header Shell (Identical to Dashboard) ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1875c0] rounded flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M5,5H19V7H5V5M12,18C9.24,18 7,15.76 7,13C7,10.24 9.24,8 12,8C14.76,8 17,10.24 17,13C17,15.76 14.76,18 12,18M12,10.5C10.62,10.5 9.5,11.62 9.5,13C9.5,14.38 10.62,15.5 12,15.5C13.38,15.5 14.5,14.38 14.5,13C14.5,11.62 13.38,10.5 12,10.5M10.88,11.62L12,12.75L13.12,11.62C12.5,11.2 11.5,11.2 10.88,11.62Z" />
              </svg>
            </div>
            <h1 onClick={() => navigate('/laundry-dashboard')} className="text-lg font-bold text-slate-800 tracking-tight cursor-pointer">LaundryKu</h1>
          </div>

          {/* User & Avatar */}
          <div className="relative flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Hi, {firstName}</span>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shadow-sm border border-slate-300 cursor-pointer overflow-hidden"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
            </button>
            <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>

            {/* Dropdown */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-12 z-50 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-[fadeIn_0.15s_ease]">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page Header ── */}
      <section className="w-full px-4 md:px-8 pt-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/laundry-dashboard')}
            className="p-1.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Manajemen Karyawan</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Kelola akses kasir & bagian produksi mitra</p>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="w-full px-4 md:px-8 pt-6 space-y-4">
        
        {/* Tombol Tambah Karyawan */}
        <button
          onClick={openModal}
          className="w-full bg-[#1875c0] hover:bg-[#1564a4] text-white font-semibold py-3.5 rounded-xl shadow-[0_4px_12px_rgba(24,117,192,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Tambah Karyawan Baru
        </button>

        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#1875c0]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm font-medium bg-white rounded-xl border border-slate-100 shadow-sm">
            Belum ada karyawan yang terdaftar.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-[fadeIn_0.3s_ease]">
            {/* Table layout on Desktop / Stack layout on Mobile */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role / Bagian</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{emp.name}</td>
                      <td className="px-6 py-4">{emp.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          emp.role === 'kasir' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : emp.role === 'produksi'
                            ? 'bg-violet-50 text-violet-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {emp.role === 'kasir' ? 'Kasir' : emp.role === 'produksi' ? 'Produksi' : emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 rounded-lg transition-all cursor-pointer"
                        >
                          Hapus Akses / Pecat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Only visible on Mobile view) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 flex flex-col gap-2 bg-white hover:bg-slate-50/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{emp.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{emp.email}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.role === 'kasir' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : emp.role === 'produksi'
                        ? 'bg-violet-50 text-violet-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {emp.role === 'kasir' ? 'Kasir' : emp.role === 'produksi' ? 'Produksi' : emp.role}
                    </span>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-slate-50">
                    <button
                      onClick={() => handleDelete(emp.id, emp.name)}
                      className="w-full py-2 text-center text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 active:scale-[0.98] rounded-xl transition-all cursor-pointer"
                    >
                      Hapus Akses / Pecat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Navigation Shell (Identical to Dashboard) ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="w-full px-6 md:px-8 py-2 flex justify-between items-center">
          <button onClick={() => navigate('/laundry-dashboard')} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L20 9V21H15V14H9V21H4V9L12 3Z" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button onClick={() => navigate('/production-tracking')} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" />
            </svg>
            <span className="text-[10px] font-medium">Produksi</span>
          </button>

          <button onClick={() => navigate('/members')} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span className="text-[10px] font-medium">Member</span>
          </button>
          
          <button onClick={() => navigate('/services')} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* ── Modal Form Tambah Karyawan ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white rounded-2xl w-full max-w-md p-5 z-10 shadow-xl transform transition-all animate-[slideUp_0.2s_ease]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Tambah Karyawan Baru</h2>
              <button onClick={closeModal} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap Karyawan</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Misal: Ahmad Saputra"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Karyawan</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ahmad@laundryku.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimal 6 karakter"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pilihan Role / Bagian</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0] cursor-pointer"
                >
                  <option value="kasir">Kasir</option>
                  <option value="produksi">Bagian Produksi</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1875c0] hover:bg-[#1564a4] text-white font-semibold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-transform disabled:opacity-70 mt-2 cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Karyawan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
