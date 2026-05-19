import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const STEPS = [
  { id: 'proses', label: 'Diterima', icon: '📥', desc: 'Masuk antrean produksi' },
  { id: 'cuci', label: 'Dicuci', icon: '🧼', desc: 'Proses pencucian serat kain' },
  { id: 'setrika', label: 'Disetrika', icon: '💨', desc: 'Penyetrikaan rapi & higienis' },
  { id: 'siap_diambil', label: 'Siap Diambil', icon: '✨', desc: 'Siap diambil di outlet' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [nomorNota, setNomorNota] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState('')

  const handleTrack = async (e) => {
    if (e) e.preventDefault()
    const trimmedNota = nomorNota.trim()
    if (!trimmedNota) return

    setLoading(true)
    setError('')
    setOrderData(null)

    try {
      const response = await axios.get(`${API_URL}/v1/public/track/${encodeURIComponent(trimmedNota)}`)
      if (response.data?.success) {
        setOrderData(response.data.data)
      } else {
        setError('Nomor nota tidak ditemukan. Periksa kembali input Anda.')
      }
    } catch (err) {
      console.error('Error tracking order:', err)
      setError(err.response?.data?.message || 'Nomor nota tidak ditemukan. Pastikan nomor nota yang diinput benar.')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStepIndex = () => {
    if (!orderData) return -1
    return STEPS.findIndex(step => step.id === orderData.status_cucian)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* ── Navigation Header ── */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧼</span>
          <span className="font-black tracking-tight bg-gradient-to-r from-[#f48425] to-amber-500 bg-clip-text text-transparent text-lg sm:text-xl">
            LAUNDRYKU PORTAL
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>Portal Admin</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* ── Main Hero & Search Area ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-16 flex flex-col gap-12">
        
        {/* Hero Banner */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto">
            Lacak Pesanan Laundry Anda Secara <span className="text-[#f48425]">Real-Time</span>
          </h2>
          <p className="text-sm text-slate-400 font-semibold max-w-md mx-auto leading-relaxed">
            Satu portal untuk semua mitra outlet kami. Pantau cucian Anda dengan cepat hanya bermodalkan nomor nota.
          </p>
        </section>

        {/* Integrated Tracking Form */}
        <section className="max-w-xl w-full mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-6">
          <div className="text-center">
            <h3 className="text-lg font-black text-slate-800">Cek Status Cucian</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Masukkan nomor nota Anda di bawah ini</p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={nomorNota}
                onChange={(e) => setNomorNota(e.target.value)}
                placeholder="Masukkan Nomor Nota (INV-XXXX)"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[#f48425]/10 focus:border-[#f48425] text-slate-800 placeholder-slate-400 transition-all uppercase"
              />
              <span className="absolute left-4 top-4.5 text-base">📄</span>
            </div>

            <button
              type="submit"
              disabled={loading || !nomorNota.trim()}
              className="py-4 px-6 bg-[#f48425] hover:bg-[#d66f1b] text-white font-extrabold text-sm rounded-2xl active:scale-[0.98] transition-all shadow-md shadow-[#f48425]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <span>Lacak Pesanan</span>
                  <span>🔍</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs font-semibold text-red-600 flex items-center gap-2.5 animate-[fadeIn_0.3s_ease]">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* ── Tracking Result ── */}
        {orderData && (
          <section className="max-w-xl w-full mx-auto space-y-6 animate-[slideUp_0.4s_ease-out]">
            
            {/* Dynamic Outlet info Card */}
            <div className="bg-[#f48425]/5 border border-[#f48425]/20 rounded-3xl p-5 flex flex-col gap-2.5">
              <span className="text-[10px] text-[#f48425] font-black uppercase tracking-widest">Tempat Pencucian / Outlet</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f48425] text-white flex items-center justify-center text-lg font-black shadow-sm shadow-[#f48425]/20">
                  🏬
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-800 uppercase tracking-wide">
                    {orderData.nama_laundry}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Cucian diproses secara profesional di outlet ini</p>
                </div>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No. Nota</span>
                  <p className="text-sm font-black text-slate-800">{orderData.nomor_nota}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pelanggan</span>
                  <p className="text-sm font-bold text-slate-800">{orderData.nama_pelanggan}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Total Tagihan</span>
                <span className="font-extrabold text-[#f48425] text-sm">
                  Rp {parseFloat(orderData.total_biaya || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
                <span>⏱️</span> Status Pengerjaan Cucian
              </h3>

              {/* Vertical Timeline bar */}
              <div className="flex flex-col gap-8 relative pl-10">
                <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-slate-100 rounded-full" />
                
                {currentStepIndex >= 0 && (
                  <div 
                    className="absolute left-[23px] top-4 w-1 bg-emerald-500 rounded-full transition-all duration-750 ease-out" 
                    style={{ 
                      height: `${(currentStepIndex / (STEPS.length - 1)) * 90}%`,
                      maxHeight: '90%'
                    }}
                  />
                )}

                {STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex
                  const isActive = index === currentStepIndex

                  return (
                    <div key={step.id} className="flex gap-4 items-start relative">
                      
                      {/* Circle node */}
                      <div className="absolute -left-[30px] flex items-center justify-center">
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 shadow-sm transition-all duration-500 ${
                            isActive 
                              ? 'bg-emerald-500 text-white border-emerald-500 scale-110 ring-4 ring-emerald-500/20 animate-pulse' 
                              : isCompleted 
                                ? 'bg-emerald-500 text-white border-emerald-500' 
                                : 'bg-white text-slate-300 border-slate-200'
                          }`}
                        >
                          {isCompleted ? '✓' : step.icon}
                        </div>
                      </div>

                      {/* Text details */}
                      <div className="flex-1 space-y-0.5">
                        <h4 className={`text-xs font-black transition-all ${
                          isActive 
                            ? 'text-emerald-600 scale-102' 
                            : isCompleted 
                              ? 'text-slate-800' 
                              : 'text-slate-400'
                        }`}>
                          {step.label}
                        </h4>
                        <p className={`text-[10px] leading-relaxed transition-all ${
                          isActive 
                            ? 'text-slate-500 font-semibold' 
                            : 'text-slate-400'
                        }`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Special Ready Call-Out Banner */}
            {orderData.status_cucian === 'siap_diambil' && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center space-y-3 shadow-md shadow-emerald-500/5 animate-[bounceSubtle_2s_infinite]">
                <span className="text-3xl block">🎉</span>
                <h3 className="text-base font-black text-emerald-800">Cucian Anda Telah Selesai!</h3>
                <p className="text-xs text-emerald-600/90 font-semibold leading-relaxed">
                  Silakan ambil cucian Anda di <span className="underline font-bold">{orderData.nama_laundry}</span> dengan menunjukkan nota Anda ke petugas.
                </p>
              </div>
            )}

          </section>
        )}

        {/* ── Features Info Cards ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200/60">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <span className="text-2xl">🏢</span>
            <h4 className="text-sm font-bold text-slate-800">SaaS Multi-Outlet</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Aplikasi mendukung banyak mitra laundry secara independen, aman, dan terintegrasi.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <span className="text-2xl">⚡</span>
            <h4 className="text-sm font-bold text-slate-800">Lacak Seketika</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Pantau tahapan cucian mulai dari antrean, pencucian, penyetrikaan, hingga siap diambil.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <span className="text-2xl">🔒</span>
            <h4 className="text-sm font-bold text-slate-800">Aman & Terpercaya</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Privasi pesanan pelanggan terjaga aman dengan pembagian database logis berbasis tenant.
            </p>
          </div>
        </section>

      </main>

      {/* Styles for premium animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}} />

      {/* ── Footer ── */}
      <footer className="text-center py-6 text-[10px] text-slate-400 font-bold tracking-wide border-t border-slate-100 bg-white">
        © {new Date().getFullYear()} LAUNDRYKU NETWORK. ALL RIGHTS RESERVED.
      </footer>
    </div>
  )
}
