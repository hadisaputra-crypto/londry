import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nama_laundry: user?.nama_laundry || '',
    old_password: '',
    password: '',
    password_confirmation: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessages, setErrorMessages] = useState({})

  const homeRoute = user?.role === 'admin_laundry' 
    ? '/laundry-dashboard' 
    : user?.role === 'kasir' 
      ? '/cashier-dashboard' 
      : '/production-tracking'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(false)
    setErrorMessages({})
    setSuccessMessage('')

    if (formData.password && formData.password !== formData.password_confirmation) {
      setErrorMessages({ password_confirmation: ['Konfirmasi password baru tidak cocok.'] })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.put('/profile', {
        name: formData.name,
        email: formData.email,
        nama_laundry: formData.nama_laundry,
        old_password: formData.old_password || null,
        password: formData.password || null,
        password_confirmation: formData.password_confirmation || null
      })

      setSuccessMessage('Profil & password berhasil diperbarui!')
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        old_password: '',
        password: '',
        password_confirmation: ''
      }))

      // Update auth store with the fresh user data returned by backend
      localStorage.setItem('auth-user', JSON.stringify(response.data.user))
      useAuthStore.setState({ user: response.data.user })

    } catch (err) {
      if (err.response?.status === 422) {
        setErrorMessages(err.response.data.errors || {})
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#1875c0] text-white shadow-md">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <button 
            onClick={() => navigate(homeRoute)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Pengaturan Akun</h1>
            <p className="text-[10px] text-white/80 font-bold leading-none mt-0.5 uppercase tracking-wider">
              {user?.nama_laundry || 'LaundryKu'}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* ── Form Section ── */}
        <section className="bg-white p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#1875c0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informasi Profil & Keamanan
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
              />
              {errorMessages.name && <p className="text-red-500 text-xs mt-1 font-medium">{errorMessages.name[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
              />
              {errorMessages.email && <p className="text-red-500 text-xs mt-1 font-medium">{errorMessages.email[0]}</p>}
            </div>

            {user?.role === 'admin_laundry' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Laundry (Tenant)</label>
                <input
                  type="text"
                  name="nama_laundry"
                  required
                  value={formData.nama_laundry}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                />
                {errorMessages.nama_laundry && <p className="text-red-500 text-xs mt-1 font-medium">{errorMessages.nama_laundry[0]}</p>}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 mt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ubah Password (Opsional)</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password Lama</label>
                  <input
                    type="password"
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleInputChange}
                    placeholder="Masukkan password lama"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                  />
                  {errorMessages.old_password && <p className="text-red-500 text-xs mt-1 font-medium">{errorMessages.old_password[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password Baru</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimal 6 karakter"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                  />
                  {errorMessages.password && <p className="text-red-500 text-xs mt-1 font-medium">{errorMessages.password[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="Ulangi password baru"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                  />
                  {errorMessages.password_confirmation && <p className="text-red-500 text-xs mt-1 font-medium">{errorMessages.password_confirmation[0]}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1875c0] hover:bg-[#135d9b] text-white font-semibold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-70 mt-4 cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </section>

        {/* ── Admin Menu Hub Section ── */}
        {user?.role === 'admin_laundry' && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Kontrol Laundry & Outlet</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Manage Catalog */}
              <button
                onClick={() => navigate('/services')}
                className="flex flex-col items-start p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl shadow-sm text-left transition-all active:scale-98 cursor-pointer"
              >
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800">Layanan & Tarif</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Kelola paket cucian</span>
              </button>

              {/* Manage Employees */}
              <button
                onClick={() => navigate('/employees')}
                className="flex flex-col items-start p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl shadow-sm text-left transition-all active:scale-98 cursor-pointer"
              >
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800">Manajemen Karyawan</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Kelola kasir & produksi</span>
              </button>
            </div>
          </section>
        )}

        {/* ── Logout Section ── */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl border border-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar dari Akun
        </button>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}
