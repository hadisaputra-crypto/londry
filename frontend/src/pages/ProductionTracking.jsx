import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

const STATUS_CONFIG = {
  proses: {
    label: 'Antrean (Proses)',
    bg: 'bg-red-50 text-red-600 border border-red-100',
    dot: 'bg-red-500',
    nextAction: 'Mulai Cuci',
    nextStatus: 'cuci',
    actionColor: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/10',
  },
  cuci: {
    label: 'Sedang Dicuci',
    bg: 'bg-blue-50 text-blue-600 border border-blue-100',
    dot: 'bg-blue-500',
    nextAction: 'Mulai Setrika',
    nextStatus: 'setrika',
    actionColor: 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-600/10',
  },
  setrika: {
    label: 'Disetrika',
    bg: 'bg-amber-50 text-amber-600 border border-amber-100',
    dot: 'bg-amber-500',
    nextAction: 'Selesai & Siap Diambil',
    nextStatus: 'siap_diambil',
    actionColor: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10',
  },
  siap_diambil: {
    label: 'Siap Diambil',
    bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    dot: 'bg-emerald-500',
    nextAction: null,
    nextStatus: null,
    actionColor: '',
  },
}

export default function ProductionTracking() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const homeRoute = user?.role === 'kasir' ? '/cashier-dashboard' : '/laundry-dashboard'
  const [showMenu, setShowMenu] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'proses', 'cuci', 'setrika', 'siap_diambil'
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  // Ambil data order aktif
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/orders')
      setOrders(data.data || [])
    } catch (err) {
      console.error('Gagal memuat data tracking produksi:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = useAuthStore(state => state.fetchUser)

  useEffect(() => {
    fetchOrders()
    fetchUser()
  }, [])

  // Fungsi cepat ubah status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await api.patch(`/orders/${orderId}/status`, { status_cucian: newStatus })
      // Update local state untuk interaksi instan & responsif
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status_cucian: newStatus } : o))
    } catch (err) {
      console.error('Gagal memperbarui status:', err)
      alert('Gagal memperbarui status cucian.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filter & Search Logic
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status_cucian === activeTab
    const matchesSearch = 
      order.nomor_nota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.member?.nama || 'Umum').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Group counts for Badge
  const getCount = (status) => orders.filter(o => o.status_cucian === status).length

  const firstName = user?.name?.split(' ')[0] || 'Mitra'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Helper untuk format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            <h1 
              onClick={() => {
                if (user?.role !== 'produksi') {
                  navigate(homeRoute)
                }
              }} 
              className={`text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5 ${user?.role !== 'produksi' ? 'cursor-pointer' : ''}`}
            >
              {user?.nama_laundry || 'LaundryKu'}
              <span className="text-[9px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full font-bold border border-violet-100 uppercase tracking-wider">
                {user?.role === 'produksi' ? 'Produksi' : user?.role === 'kasir' ? 'Kasir' : 'Admin'}
              </span>
            </h1>
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
                    onClick={() => navigate('/settings')}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pengaturan Akun
                  </button>
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

      {/* ── Page Header (Inside Container) ── */}
      <section className="w-full px-4 md:px-8 pt-6">
        <div className="flex items-center gap-3">
          {user?.role !== 'produksi' && (
            <button 
              onClick={() => navigate(homeRoute)}
              className="p-1.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Alur Produksi Cucian</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pantau & kelola status produksi mitra</p>
          </div>
        </div>
      </section>

      {/* ── Search Bar ── */}
      <div className="w-full px-4 md:px-8 pt-5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Nota atau nama pelanggan..."
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#f48425]/10 focus:border-[#f48425] text-slate-800 placeholder-slate-400 shadow-sm transition-all"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ── Tab Navigation (Scrollable on Mobile) ── */}
      <div className="w-full px-4 md:px-8 py-3">
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
        <div 
          className="overflow-x-auto flex flex-nowrap gap-2 no-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex-shrink-0 cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-[#f48425] text-white shadow-md shadow-[#f48425]/20' 
                : 'bg-white text-slate-500 border border-slate-200/80 hover:text-slate-700 shadow-sm'
            }`}
          >
            Semua ({orders.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === status 
                  ? 'bg-[#f48425] text-white shadow-md shadow-[#f48425]/20' 
                  : 'bg-white text-slate-500 border border-slate-200/80 hover:text-slate-700 shadow-sm'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label} ({getCount(status)})
            </button>
          ))}
        </div>
      </div>

      {/* ── List Content ── */}
      <main className="w-full px-4 md:px-8 space-y-4">
        {/* Create New Order Button */}
        {user?.role !== 'produksi' && (
          <button
            onClick={() => navigate('/input-order')}
            className="w-full bg-[#f48425] hover:bg-[#d6701b] text-white font-semibold py-3.5 rounded-xl shadow-[0_4px_12px_rgba(244,132,37,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Buat Order Baru
          </button>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#f48425]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm font-medium bg-white rounded-xl border border-slate-100 shadow-sm">
            Tidak ada pesanan aktif yang cocok.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const cfg = STATUS_CONFIG[order.status_cucian] || STATUS_CONFIG.proses
              return (
                <div 
                  key={order.id}
                  className="bg-white p-4 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col gap-3.5 animate-[fadeIn_0.3s_ease]"
                >
                  {/* Header Row: Nota/Badge & Status Dropdown */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-3 w-full">
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-800">{order.nomor_nota}</h3>
                      <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        {order.member?.nama || 'Pelanggan Umum'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Masuk: {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                      <select
                        value={order.status_cucian}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#f48425] cursor-pointer"
                      >
                        {Object.entries(STATUS_CONFIG).map(([status, item]) => (
                          <option key={status} value={status}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* List Items / Services */}
                  <div className="space-y-1 pl-2 border-l-2 border-slate-200">
                    {order.order_details?.map(detail => (
                      <p key={detail.id} className="text-[11px] font-semibold text-slate-500">
                        {detail.service?.nama_layanan} <span className="text-slate-400 font-normal">x{detail.qty}</span>
                      </p>
                    ))}
                  </div>

                  {/* Quick Action Button */}
                  {cfg.nextStatus && (
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, cfg.nextStatus)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${cfg.actionColor}`}
                    >
                      {updatingId === order.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <span>{cfg.nextAction}</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── Bottom Navigation Shell ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="w-full px-6 md:px-8 py-2 flex justify-around sm:justify-between items-center">
          {user?.role !== 'produksi' && (
            <button onClick={() => navigate(homeRoute)} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
              <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L20 9V21H15V14H9V21H4V9L12 3Z" />
              </svg>
              <span className="text-[10px] font-medium">Home</span>
            </button>
          )}
          
          <button className="flex flex-col items-center p-2 text-[#1875c0]">
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" />
            </svg>
            <span className="text-[10px] font-bold">Produksi</span>
          </button>

          {user?.role !== 'produksi' && (
            <button onClick={() => navigate('/members')} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-[10px] font-medium">Member</span>
            </button>
          )}
          
          {user?.role === 'admin_laundry' && (
            <button onClick={() => navigate('/services')} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-medium">Settings</span>
            </button>
          )}

          {user?.role === 'produksi' && (
            <button onClick={handleLogout} className="flex flex-col items-center p-2 text-red-500 hover:text-red-600 transition-colors cursor-pointer">
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-[10px] font-bold">Keluar</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
