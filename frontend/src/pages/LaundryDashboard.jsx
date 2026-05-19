import { useState, useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'

const STATUS_CONFIG = {
  proses: {
    label: 'Sedang Diproses',
    bg: 'bg-[#f48425]', // Orange
    text: 'text-white',
  },
  cuci: {
    label: 'Sedang Dicuci',
    bg: 'bg-[#1875c0]', // Blue
    text: 'text-white',
  },
  setrika: {
    label: 'Setrika',
    bg: 'bg-violet-500', 
    text: 'text-white',
  },
  siap_diambil: {
    label: 'Siap Diantar',
    bg: 'bg-[#409b4f]', // Green
    text: 'text-white',
  },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function LaundryDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const [stats, setStats] = useState({ proses: 0, cuci: 0, setrika: 0, siap_diambil: 0, total: 0 })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Search Modal States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null)

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return
    setIsSearching(true)
    try {
      const { data } = await api.get(`/orders?search=${encodeURIComponent(trimmedQuery)}`)
      setSearchResults(data.data)
    } catch (err) {
      console.error('Gagal mencari pesanan:', err)
      alert('Gagal mencari pesanan.')
    } finally {
      setIsSearching(false)
    }
  }

  const fetchUser = useAuthStore(state => state.fetchUser)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/laundry/stats'),
          api.get('/laundry/recent-orders'),
        ])
        setStats(statsRes.data)
        setOrders(ordersRes.data)
      } catch (err) {
        console.error('Gagal memuat data dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const firstName = user?.name?.split(' ')[0] || 'Andi'
  const activeOrdersCount = stats.proses + stats.cuci + stats.setrika; // unfinished orders

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1875c0] rounded flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M5,5H19V7H5V5M12,18C9.24,18 7,15.76 7,13C7,10.24 9.24,8 12,8C14.76,8 17,10.24 17,13C17,15.76 14.76,18 12,18M12,10.5C10.62,10.5 9.5,11.62 9.5,13C9.5,14.38 10.62,15.5 12,15.5C13.38,15.5 14.5,14.38 14.5,13C14.5,11.62 13.38,10.5 12,10.5M10.88,11.62L12,12.75L13.12,11.62C12.5,11.2 11.5,11.2 10.88,11.62Z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              {user?.nama_laundry || 'LaundryKu'}
              <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold border border-blue-100 uppercase tracking-wider">
                Admin
              </span>
            </h1>
          </div>

          {/* User & Avatar */}
          <div className="relative flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Hi, {firstName}</span>
            <button
              id="btn-avatar"
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
                    id="btn-logout-laundry"
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

      {/* ── Banner ── */}
      <div className="w-full h-40 bg-blue-100 overflow-hidden relative">
        <img 
          src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=800&h=300" 
          alt="Laundry Banner" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-[#1875c0]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <>
          {/* ── Quick Actions ── */}
          <section className="px-4 -mt-10 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Input Order */}
              <button
                id="btn-input-order"
                onClick={() => navigate('/input-order')}
                className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-[#409b4f] text-white shadow-md active:scale-95 transition-transform"
              >
                <div className="mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold leading-tight">Input Order</span>
              </button>

              {/* Tracking */}
              <button
                id="btn-tracking"
                onClick={() => {
                  setIsSearchModalOpen(true)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-[#1875c0] text-white shadow-md active:scale-95 transition-transform"
              >
                <div className="mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold leading-tight">Tracking Nota</span>
              </button>

              {/* Alur Produksi */}
              <button
                id="btn-produksi"
                onClick={() => navigate('/production-tracking')}
                className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-violet-600 text-white shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                <div className="mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold leading-tight">Alur Produksi</span>
              </button>

              {/* Laporan -> Semua Order */}
              <button
                id="btn-laporan"
                onClick={() => navigate('/orders')}
                className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-[#f48425] text-white shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                <div className="mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold leading-tight">Semua Order</span>
              </button>

              {/* Kelola Karyawan */}
              <button
                id="btn-karyawan"
                onClick={() => navigate('/employees')}
                className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-indigo-600 text-white shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                <div className="mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold leading-tight">Karyawan</span>
              </button>
            </div>
          </section>

          {/* ── Pesanan Terbaru ── */}
          <section className="px-4 mt-8">
            <div className="mb-4">
              <h2 className="text-[15px] font-bold text-slate-800">Pesanan Terbaru</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">{activeOrdersCount} Orderan Belum Selesai</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">Belum ada pesanan.</div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status_cucian] || STATUS_CONFIG.proses
                  return (
                    <div
                      key={order.id}
                      className="bg-white p-4 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] border border-slate-100"
                    >
                      <p className="text-[13px] font-bold text-slate-700">
                        Order #{order.id} - {order.nomor_nota}
                      </p>
                      <div className="flex items-center mt-2.5 gap-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-40 pb-safe">
        <button className="flex flex-col items-center p-2 text-[#1875c0]">
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L20 9V21H15V14H9V21H4V9L12 3Z" />
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => navigate('/members')} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span className="text-[10px] font-medium">Member</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center p-2 text-slate-400 hover:text-[#1875c0] transition-colors cursor-pointer">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
        {/* ── Search / Tracking Modal ── */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSearchModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 z-10 shadow-xl max-h-[85vh] overflow-y-auto transform transition-all animate-[slideUp_0.2s_ease]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Pencarian / Tracking Pesanan</h2>
                <p className="text-xs text-slate-500">Cari berdasarkan nama pelanggan, nota, atau tanggal</p>
              </div>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama, nota, atau YYYY-MM-DD..."
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#1875c0] hover:bg-[#15609e] text-white px-5 py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSearching ? 'Mencari...' : 'Cari'}
              </button>
            </form>

            {/* Results */}
            <div className="space-y-3">
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-[#1875c0]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : searchResults.length === 0 ? (
                searchQuery.trim() && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Tidak ada pesanan yang cocok.
                  </div>
                )
              ) : (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {searchResults.map(order => {
                    const cfg = STATUS_CONFIG[order.status_cucian] || STATUS_CONFIG.proses
                    return (
                      <div key={order.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between sm:flex-row sm:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{order.nomor_nota}</span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-600">
                            Pelanggan: {order.member?.nama || 'Umum'} {order.member?.nomor_hp ? `(${order.member.nomor_hp})` : ''}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Tanggal: {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                          <span className="text-xs font-bold text-[#1875c0] mb-1">
                            Rp {parseFloat(order.total_harga || 0).toLocaleString('id-ID')}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                            {order.status_cucian === 'siap_diambil' && (
                              <button
                                type="button"
                                onClick={() => setSelectedPrintOrder(order)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/edit-order/${order.id}`)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                            >
                              Edit / Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detail & Print ── */}
      {selectedPrintOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 print:static print:block print:p-0 print-area">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden" onClick={() => setSelectedPrintOrder(null)}></div>
          
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10 shadow-xl flex flex-col print:shadow-none print:w-[80mm] print:rounded-none print:max-h-none animate-[slideUp_0.2s_ease] print:animate-none">
            
            {/* Action Bar (Hidden on Print) */}
            <div className="sticky top-0 bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center print:hidden rounded-t-2xl">
              <button onClick={() => setSelectedPrintOrder(null)} className="text-slate-500 p-2 rounded-full hover:bg-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Nota
              </button>
            </div>

            {/* Area Struk / Print Area */}
            <div className="p-6 print:p-2 bg-white text-slate-800 font-mono text-sm leading-tight">
              <div className="text-center mb-6 border-b-2 border-dashed border-slate-300 pb-4">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-1">
                  {selectedPrintOrder.tenant?.nama_laundry?.toUpperCase() || 'LAUNDRYKU'}
                </h2>
                <p className="text-xs text-slate-500">Jl. Contoh Alamat No. 123</p>
                <p className="text-xs text-slate-500">Telp: 0812-3456-7890</p>
              </div>

              <div className="mb-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Nota</span>
                  <span className="font-bold">{selectedPrintOrder.nomor_nota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal</span>
                  <span className="font-semibold">{formatDate(selectedPrintOrder.created_at)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-slate-500">Pelanggan</span>
                  <span className="font-bold">{selectedPrintOrder.member?.nama || 'UMUM'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold uppercase">{STATUS_CONFIG[selectedPrintOrder.status_cucian]?.label || selectedPrintOrder.status_cucian}</span>
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-dashed border-slate-300 py-3 mb-4 space-y-2">
                <div className="font-bold text-xs flex justify-between mb-2 pb-1 border-b border-slate-100">
                  <span>Layanan</span>
                  <span>Subtotal</span>
                </div>
                {selectedPrintOrder.order_details && selectedPrintOrder.order_details.map(item => (
                  <div key={item.id} className="text-xs">
                    <div className="font-semibold">{item.service?.nama_layanan || 'Layanan Dihapus'}</div>
                    <div className="flex justify-between text-slate-500">
                      <span>{item.qty} {item.service?.satuan_unit || 'x'} @ Rp{parseFloat(item.service?.harga_per_unit || 0).toLocaleString('id-ID')}</span>
                      <span className="text-slate-800 font-semibold">Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center font-bold text-base mb-6">
                <span>TOTAL</span>
                <span>Rp {parseFloat(selectedPrintOrder.total_harga || 0).toLocaleString('id-ID')}</span>
              </div>

              <div className="text-center text-[10px] text-slate-500 space-y-1 pt-4 border-t-2 border-dashed border-slate-300">
                <p>Terima kasih telah mencuci di {selectedPrintOrder.tenant?.nama_laundry || 'LaundryKu'}.</p>
                <p>Barang yang tidak diambil lebih dari 1 bulan</p>
                <p>di luar tanggung jawab kami.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Global CSS for Animations and Print layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  )
}
