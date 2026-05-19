import { useState, useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'

export default function SuperadminDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Sidebar/Bottom Nav Tab state
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'tenants' | 'onboarding' | 'settings'

  // Data state
  const [stats, setStats] = useState({
    total_active_tenants: 0,
    total_suspended_tenants: 0,
    total_transaction_volume: 0
  })
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Register Form state
  const [formData, setFormData] = useState({
    nama_laundry: '',
    name: '',
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessages, setErrorMessages] = useState({})

  // Toggle Loading state per Tenant
  const [togglingId, setTogglingId] = useState(null)

  // Mobile User Dropdown
  const [showMenu, setShowMenu] = useState(false)

  // Reset Password Modal state
  const [resetTenant, setResetTenant] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [resetError, setResetError] = useState('')

  // Superadmin Profile edit state
  const { fetchUser } = useAuthStore()
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    old_password: '',
    password: '',
    password_confirmation: ''
  })
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileErrors, setProfileErrors] = useState({})

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileSubmitting(true)
    setProfileSuccess('')
    setProfileErrors({})

    try {
      await api.put('/profile', profileData)
      setProfileSuccess('Profil dan keamanan akun berhasil diperbarui!')
      setProfileData(prev => ({
        ...prev,
        old_password: '',
        password: '',
        password_confirmation: ''
      }))
      await fetchUser()
    } catch (err) {
      if (err.response?.status === 422) {
        setProfileErrors(err.response.data.errors || {})
      } else {
        alert(err.response?.data?.message || 'Gagal memperbarui profil.')
      }
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password baru minimal 6 karakter.')
      return
    }

    setIsResetting(true)
    setResetError('')
    try {
      await api.post(`/superadmin/tenants/${resetTenant.id}/reset-password`, {
        password: newPassword
      })
      alert(`Password untuk admin laundry "${resetTenant.nama_laundry}" berhasil direset!`)
      setResetTenant(null)
      setNewPassword('')
    } catch (err) {
      setResetError(err.response?.data?.message || 'Gagal mereset password.')
    } finally {
      setIsResetting(false)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        api.get('/superadmin/stats'),
        api.get('/superadmin/tenants')
      ])
      setStats(statsRes.data)
      setTenants(tenantsRes.data)
    } catch (err) {
      console.error('Gagal mengambil data dashboard superadmin:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterTenant = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessages({})

    try {
      await api.post('/superadmin/tenants', formData)
      setSuccessMessage('Mitra laundry baru berhasil didaftarkan!')
      setFormData({
        nama_laundry: '',
        name: '',
        email: '',
        password: ''
      })
      // Refresh data
      await fetchData()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrorMessages(err.response.data.errors || {})
      } else {
        alert(err.response?.data?.message || 'Gagal mendaftarkan tenant baru.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (id) => {
    setTogglingId(id)
    try {
      const response = await api.post(`/superadmin/tenants/${id}/toggle`)
      // Update local status
      setTenants(prev => prev.map(t => t.id === id ? { ...t, status_langganan: response.data.status_langganan } : t))
      // Refresh stats
      const statsRes = await api.get('/superadmin/stats')
      setStats(statsRes.data)
    } catch (err) {
      console.error('Gagal mengubah status tenant:', err)
      alert('Gagal mengubah status langganan tenant.')
    } finally {
      setTogglingId(null)
    }
  }

  const filteredTenants = tenants.filter(t => 
    t.nama_laundry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pemilik?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email_admin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(t.id).includes(searchQuery)
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* ── SIDEBAR (Hanya Tampil di Desktop / md) ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1875c0] rounded flex items-center justify-center text-white shadow-md font-black">
              SA
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 tracking-wider uppercase leading-none">Superadmin</h1>
              <span className="text-[10px] text-slate-400 mt-1 block">Platform Control</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-[#1875c0] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Platform Overview
            </button>

            <button
              onClick={() => setActiveTab('tenants')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'tenants' ? 'bg-[#1875c0] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Mitra Laundry
            </button>

            <button
              onClick={() => setActiveTab('onboarding')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'onboarding' ? 'bg-[#1875c0] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Daftar Laundry Baru
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-[#1875c0] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Edit Profil
            </button>
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
              {user?.name?.[0] || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <span className="text-[10px] text-[#1875c0] font-bold uppercase">Superadmin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ── HEADER MOBILE (Hanya Tampil di Mobile / < md) ── */}
      <header className="md:hidden sticky top-0 z-40 bg-[#1875c0] text-white shadow-md shrink-0">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-[#1875c0] font-black text-xs shadow-sm">
              SA
            </div>
            <h1 className="text-sm font-bold tracking-tight">Superadmin Panel</h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shadow-sm border border-white/20 cursor-pointer overflow-hidden"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-10 z-50 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden text-slate-800 animate-[fadeIn_0.15s_ease]">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('settings'); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer border-b border-slate-100"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Edit Profil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar Akun
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA (Responsive) ── */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50 overflow-y-auto pb-24 md:pb-0">
        {/* Top Header Desktop (Hidden on mobile) */}
        <header className="hidden md:flex h-16 border-b border-slate-200 bg-white items-center justify-between px-8 shrink-0 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {activeTab === 'overview' && 'Platform Overview'}
              {activeTab === 'tenants' && 'Mitra Laundry Management'}
              {activeTab === 'onboarding' && 'Mitra Onboarding'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-semibold">
            Status Sistem: <span className="text-emerald-600 font-bold">ONLINE & STABLE</span>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#1875c0]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <div className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1 max-w-6xl w-full mx-auto">
            {/* ── SECTION 1: STATS OVERVIEW (Always visible at top of overview) ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {/* Mitra Card */}
                <div className="bg-white p-3 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-50 text-[#1875c0] rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Mitra Laundry</p>
                    <p className="text-sm md:text-xl font-black text-slate-800 mt-0.5 leading-none">
                      {stats.total_active_tenants + stats.total_suspended_tenants}
                    </p>
                    <span className="hidden md:inline text-[10px] text-slate-500 mt-1 font-medium block">
                      ({stats.total_active_tenants} Aktif)
                    </span>
                  </div>
                </div>

                {/* Pendapatan Card */}
                <div className="bg-white p-3 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="overflow-hidden w-full">
                    <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Volume Transaksi</p>
                    <p className="text-xs md:text-xl font-black text-slate-800 mt-0.5 leading-none truncate">
                      Rp{stats.total_transaction_volume.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Transaksi Card */}
                <div className="bg-white p-3 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Total Transaksi</p>
                    <p className="text-sm md:text-xl font-black text-slate-800 mt-0.5 leading-none">
                      {tenants.reduce((acc, t) => acc + (t.orders_count || 0), 0)}
                    </p>
                    <span className="hidden md:inline text-[10px] text-slate-500 mt-1 font-medium block">
                      Pesanan
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 2: TABEL MANAJEMEN MITRA LAUNDRY ── */}
            {(activeTab === 'overview' || activeTab === 'tenants') && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-sm md:text-md font-bold text-slate-800">Daftar Mitra Laundry</h3>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-1">Daftar lengkap beserta administrasi akun mitra platform multi-tenant.</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:flex-initial">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama laundry, pemilik, email..."
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0] w-full md:w-64"
                      />
                    </div>

                    {activeTab === 'overview' && (
                      <button
                        onClick={() => setActiveTab('tenants')}
                        className="text-xs text-[#1875c0] hover:text-[#135d9b] font-bold cursor-pointer shrink-0 ml-1"
                      >
                        Lihat Semua &rarr;
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-3 md:p-4">ID Tenant</th>
                        <th className="p-3 md:p-4">Nama Laundry</th>
                        <th className="p-3 md:p-4">Pemilik</th>
                        <th className="p-3 md:p-4">Email Admin</th>
                        <th className="p-3 md:p-4">Status</th>
                        <th className="p-3 md:p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTenants.map(t => {
                        const isSuspended = t.status_langganan === 'suspended'
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 md:p-4 font-mono text-slate-400">#{t.id}</td>
                            <td className="p-3 md:p-4 font-bold text-slate-800">{t.nama_laundry}</td>
                            <td className="p-3 md:p-4 text-slate-600">{t.pemilik}</td>
                            <td className="p-3 md:p-4 font-mono text-slate-500">{t.email_admin}</td>
                            <td className="p-3 md:p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${isSuspended ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {isSuspended ? 'Suspended' : 'Aktif'}
                              </span>
                            </td>
                            <td className="p-3 md:p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  disabled={togglingId === t.id}
                                  onClick={() => handleToggleStatus(t.id)}
                                  className={`px-2.5 py-1.5 rounded font-bold text-[9px] uppercase transition-all cursor-pointer ${isSuspended ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'}`}
                                >
                                  {togglingId === t.id ? 'Loading...' : isSuspended ? 'Aktifkan' : 'Blokir'}
                                </button>
                                <button
                                  onClick={() => setResetTenant(t)}
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded font-bold text-[9px] uppercase transition-all cursor-pointer"
                                >
                                  Reset Pwd
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {tenants.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-slate-500 font-semibold">
                            Belum ada mitra laundry yang bergabung.
                          </td>
                        </tr>
                      ) : filteredTenants.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-slate-500 font-semibold">
                            Tidak ada mitra laundry yang cocok dengan pencarian "{searchQuery}".
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── SECTION 3: FORM DAFTARKAN LAUNDRY BARU (Mitra Onboarding) ── */}
            {(activeTab === 'overview' || activeTab === 'onboarding') && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl">
                <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm md:text-md font-bold text-slate-800">Daftarkan Laundry Baru (Mitra Onboarding)</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-1">Daftarkan outlet mitra laundry baru secara instan di lapangan.</p>
                </div>

                {successMessage && (
                  <div className="mx-4 md:mx-6 mt-4 p-3 md:p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleRegisterTenant} className="p-4 md:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nama Laundry (Tenant)</label>
                      <input
                        type="text"
                        name="nama_laundry"
                        required
                        value={formData.nama_laundry}
                        onChange={handleInputChange}
                        placeholder="Misal: Sparkling Laundry Kota"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                      />
                      {errorMessages.nama_laundry && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errorMessages.nama_laundry[0]}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nama Pemilik / Admin</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Misal: Haji Syarifudin"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                      />
                      {errorMessages.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errorMessages.name[0]}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Email Admin Laundry</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="pemilik@email.com"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                      />
                      {errorMessages.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errorMessages.email[0]}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Password Sementara</label>
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Minimal 6 karakter"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                      />
                      {errorMessages.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errorMessages.password[0]}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1875c0] hover:bg-[#135d9b] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider mt-4 disabled:opacity-50 cursor-pointer shadow-md transition-all active:scale-[0.99]"
                  >
                    {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Mitra Baru'}
                  </button>
                </form>
              </div>
            )}

            {/* ── SECTION 4: EDIT PROFIL SUPERADMIN ── */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl">
                <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm md:text-md font-bold text-slate-800">Edit Profil & Keamanan Akun</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-1">Perbarui informasi profil dan sandi masuk akun Superadmin Anda.</p>
                </div>

                {profileSuccess && (
                  <div className="mx-4 md:mx-6 mt-4 p-3 md:p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {profileSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="p-4 md:p-6 space-y-6">
                  {/* Informasi Akun */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#1875c0] uppercase tracking-wider">Informasi Akun</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nama Lengkap"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                        />
                        {profileErrors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{profileErrors.name[0]}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Alamat Email</label>
                        <input
                          type="email"
                          required
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                        />
                        {profileErrors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{profileErrors.email[0]}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Keamanan & Sandi */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-[#1875c0] uppercase tracking-wider">Ubah Keamanan (Opsional)</h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Password Lama</label>
                      <input
                        type="password"
                        value={profileData.old_password}
                        onChange={(e) => setProfileData(prev => ({ ...prev, old_password: e.target.value }))}
                        placeholder="Masukkan password lama untuk verifikasi"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                      />
                      {profileErrors.old_password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{profileErrors.old_password[0]}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Password Baru</label>
                        <input
                          type="password"
                          value={profileData.password}
                          onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Password baru (min. 6 karakter)"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                        />
                        {profileErrors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{profileErrors.password[0]}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          value={profileData.password_confirmation}
                          onChange={(e) => setProfileData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                          placeholder="Ulangi password baru"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSubmitting}
                    className="w-full bg-[#1875c0] hover:bg-[#135d9b] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider mt-4 disabled:opacity-50 cursor-pointer shadow-md transition-all active:scale-[0.99]"
                  >
                    {profileSubmitting ? 'Menyimpan...' : 'Perbarui Akun'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── STICKY BOTTOM NAVIGATION MOBILE (Hanya Tampil di Mobile / < md) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'overview' ? 'text-[#1875c0]' : 'text-slate-400 hover:text-[#1875c0]'}`}
        >
          <svg className="w-5.5 h-5.5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Overview</span>
        </button>

        <button 
          onClick={() => setActiveTab('tenants')}
          className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'tenants' ? 'text-[#1875c0]' : 'text-slate-400 hover:text-[#1875c0]'}`}
        >
          <svg className="w-5.5 h-5.5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Mitra</span>
        </button>

        <button 
          onClick={() => setActiveTab('onboarding')}
          className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'onboarding' ? 'text-[#1875c0]' : 'text-slate-400 hover:text-[#1875c0]'}`}
        >
          <svg className="w-5.5 h-5.5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Onboard</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'settings' ? 'text-[#1875c0]' : 'text-slate-400 hover:text-[#1875c0]'}`}
        >
          <svg className="w-5.5 h-5.5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Profil</span>
        </button>
      </nav>

      {/* ── MODAL RESET PASSWORD ── */}
      {resetTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setResetTenant(null)} />

          {/* Modal Box */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-[fadeIn_0.2s_ease]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Reset Password Admin</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{resetTenant.nama_laundry}</p>
              </div>
              <button 
                onClick={() => setResetTenant(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
                  {resetError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Password Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru (min. 6 karakter)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/10 focus:border-[#1875c0]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setResetTenant(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-2 bg-[#1875c0] hover:bg-[#135d9b] text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
