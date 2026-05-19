import { useState } from 'react'
import api from '../lib/axios'

const STEPS = [
  { id: 'proses', label: 'Diterima', icon: '📥', desc: 'Pesanan masuk dalam antrean' },
  { id: 'cuci', label: 'Dicuci', icon: '🧼', desc: 'Pencucian & pengeringan serat kain' },
  { id: 'setrika', label: 'Disetrika', icon: '💨', desc: 'Penyetrikaan rapi & higienis' },
  { id: 'siap_diambil', label: 'Siap Diambil', icon: '✨', desc: 'Siap diambil atau diantar' },
]

export default function PublicTracking() {
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
      const response = await api.get(`/v1/public/track/${encodeURIComponent(trimmedNota)}`)
      if (response.data?.success) {
        setOrderData(response.data.data)
      } else {
        setError('Nomor nota tidak ditemukan. Periksa kembali input Anda.')
      }
    } catch (err) {
      console.error('Error tracking order:', err)
      setError(err.response?.data?.message || 'Nomor nota tidak ditemukan atau terjadi kesalahan server.')
    } finally {
      setLoading(false)
    }
  }

  // Get index of the current active step
  const getCurrentStepIndex = () => {
    if (!orderData) return -1
    return STEPS.findIndex(step => step.id === orderData.status_cucian)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/45 text-slate-800 flex flex-col font-sans">
      
      {/* ── Navbar/Logo ── */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧼</span>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent text-lg">
            {orderData?.nama_laundry ? orderData.nama_laundry.toUpperCase() : 'LAUNDRYKU'}
          </span>
        </div>
        <span className="text-xs font-bold text-indigo-600/80 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Pelanggan
        </span>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col justify-start gap-8">
        
        {/* Landing Section / Search Card */}
        <section className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-4">
          <div className="text-center space-y-2 mb-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Cek Status Cucian Anda</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Pantau tahapan cucian Anda secara langsung tanpa harus keluar rumah
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                value={nomorNota}
                onChange={(e) => setNomorNota(e.target.value)}
                placeholder="Masukkan Nomor Nota (Contoh: INV-XXXX)"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 text-slate-800 placeholder-slate-400 transition-all uppercase"
              />
              <span className="absolute left-4 top-4.5 text-base">📄</span>
            </div>

            <button
              type="submit"
              disabled={loading || !nomorNota.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl active:scale-[0.99] transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mencari Pesanan...</span>
                </>
              ) : (
                <>
                  <span>Cek Status</span>
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

        {/* ── Results Container ── */}
        {orderData && (
          <section className="space-y-6 animate-[slideUp_0.4s_ease-out]">
            
            {/* Order Details Header */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-100/90 space-y-3">
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
                <span className="font-extrabold text-indigo-600 text-sm">
                  Rp {parseFloat(orderData.total_biaya || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Aesthetic Timeline Tracker */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
                <span>⏱️</span> Progres Cucian
              </h3>

              {/* Progress Bar Container */}
              <div className="flex flex-col gap-8 relative pl-10">
                {/* Vertical Timeline bar */}
                <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-slate-100 rounded-full" />
                
                {/* Dynamic Active Timeline bar */}
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
                  const isFuture = index > currentStepIndex

                  return (
                    <div key={step.id} className="flex gap-4 items-start relative">
                      
                      {/* Left Circle Node */}
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

                      {/* Right Text Block */}
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

            {/* Special Call-Out / Alert Banner if Ready */}
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
      <footer className="text-center py-6 text-[10px] text-slate-400 font-bold tracking-wide border-t border-slate-100 bg-white/40">
        © {new Date().getFullYear()} {orderData?.nama_laundry ? orderData.nama_laundry : 'LAUNDRYKU'}. ALL RIGHTS RESERVED.
      </footer>
    </div>
  )
}
