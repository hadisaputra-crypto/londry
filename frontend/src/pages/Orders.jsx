import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

const STATUS_CONFIG = {
  proses: { label: 'Sedang Diproses', bg: 'bg-[#f48425]', text: 'text-white' },
  cuci: { label: 'Sedang Dicuci', bg: 'bg-[#1875c0]', text: 'text-white' },
  setrika: { label: 'Setrika', bg: 'bg-violet-500', text: 'text-white' },
  siap_diambil: { label: 'Siap Diantar', bg: 'bg-[#409b4f]', text: 'text-white' },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const homeRoute = user?.role === 'kasir' ? '/cashier-dashboard' : '/laundry-dashboard'
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal States
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatus, setNewStatus] = useState('proses')
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders')
      setOrders(data.data)
    } catch (error) {
      console.error('Gagal mengambil data order:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // === Actions ===
  
  const openStatusModal = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status_cucian)
    setIsStatusModalOpen(true)
  }

  const openDetailModal = async (id) => {
    try {
      const { data } = await api.get(`/orders/${id}`)
      setSelectedOrder(data.data)
      setIsDetailModalOpen(true)
    } catch (error) {
      console.error('Gagal mengambil detail order:', error)
      alert('Gagal memuat detail pesanan.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus secara permanen order ini?')) {
      try {
        await api.delete(`/orders/${id}`)
        await fetchOrders()
      } catch (error) {
        console.error('Gagal menghapus order:', error)
        alert('Gagal menghapus order.')
      }
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      await api.patch(`/orders/${selectedOrder.id}/status`, { status_cucian: newStatus })
      await fetchOrders()
      setIsStatusModalOpen(false)
    } catch (error) {
      console.error('Gagal update status:', error)
      alert('Gagal memperbarui status cucian.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans print:bg-white print:pb-0">
      
      {/* ── Header (Hidden on Print) ── */}
      <header className="sticky top-0 z-40 bg-[#f48425] text-white shadow-md print:hidden">
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
            <h1 className="text-lg font-bold tracking-tight">Semua Orderan</h1>
            <p className="text-[10px] text-white/80 font-bold leading-none mt-0.5 uppercase tracking-wider">
              {user?.nama_laundry || 'LaundryKu'}
            </p>
          </div>
        </div>
      </header>

      {/* ── Main Content (Hidden on Print) ── */}
      <main className="p-4 space-y-4 print:hidden">
        <button
          onClick={() => navigate('/input-order')}
          className="w-full bg-[#f48425] hover:bg-[#d6701b] text-white font-semibold py-3.5 rounded-xl shadow-[0_4px_12px_rgba(244,132,37,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buat Order Baru
        </button>

        {loading ? (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-[#f48425]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-100 shadow-sm">
            Belum ada pesanan.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status_cucian] || STATUS_CONFIG.proses
              return (
                <div key={order.id} className="bg-white p-4 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-800">{order.nomor_nota}</h3>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        {order.member?.nama || 'Pelanggan Umum'}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-sm font-bold text-indigo-600">
                      Rp {parseFloat(order.total_harga || 0).toLocaleString('id-ID')}
                    </span>
                    <div className="flex gap-1.5">
                      <button onClick={() => openDetailModal(order.id)} className="px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg active:bg-indigo-100 transition-colors">
                        Detail
                      </button>
                      <button onClick={() => navigate(`/edit-order/${order.id}`)} className="px-3 py-1.5 text-[11px] font-bold text-teal-600 bg-teal-50 rounded-lg active:bg-teal-100 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => openStatusModal(order)} className="px-3 py-1.5 text-[11px] font-bold text-[#f48425] bg-orange-50 rounded-lg active:bg-orange-100 transition-colors">
                        Update
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg active:bg-red-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── Modal Edit Status ── */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 print:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsStatusModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 z-10 shadow-xl transform transition-all animate-[slideUp_0.2s_ease]">
            <h2 className="text-base font-bold text-slate-800 mb-1">Update Status Pesanan</h2>
            <p className="text-xs text-slate-500 mb-4">Nota: {selectedOrder.nomor_nota}</p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-2">
                {Object.keys(STATUS_CONFIG).map(statusKey => (
                  <label key={statusKey} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${newStatus === statusKey ? 'border-[#f48425] bg-orange-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="status" 
                      value={statusKey} 
                      checked={newStatus === statusKey}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-4 h-4 text-[#f48425] focus:ring-[#f48425]"
                    />
                    <span className="ml-3 text-sm font-semibold text-slate-700">{STATUS_CONFIG[statusKey].label}</span>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-[#f48425] text-white font-semibold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-transform disabled:opacity-70 mt-2"
              >
                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Detail & Print ── */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 print:static print:block print:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden" onClick={() => setIsDetailModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10 shadow-xl flex flex-col print:shadow-none print:w-[80mm] print:rounded-none print:max-h-none animate-[slideUp_0.2s_ease] print:animate-none">
            
            {/* Action Bar (Hidden on Print) */}
            <div className="sticky top-0 bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center print:hidden rounded-t-2xl">
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-500 p-2 rounded-full hover:bg-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 active:scale-95">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Nota
              </button>
            </div>

            {/* Area Struk / Print Area */}
            <div className="p-6 print:p-2 bg-white text-slate-800 font-mono text-sm leading-tight">
              <div className="text-center mb-6 border-b-2 border-dashed border-slate-300 pb-4">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-1">LAUNDRYKU</h2>
                <p className="text-xs text-slate-500">Jl. Contoh Alamat No. 123</p>
                <p className="text-xs text-slate-500">Telp: 0812-3456-7890</p>
              </div>

              <div className="mb-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Nota</span>
                  <span className="font-bold">{selectedOrder.nomor_nota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal</span>
                  <span className="font-semibold">{formatDate(selectedOrder.created_at)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-slate-500">Pelanggan</span>
                  <span className="font-bold">{selectedOrder.member?.nama || 'UMUM'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold uppercase">{STATUS_CONFIG[selectedOrder.status_cucian]?.label || selectedOrder.status_cucian}</span>
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-dashed border-slate-300 py-3 mb-4 space-y-2">
                <div className="font-bold text-xs flex justify-between mb-2 pb-1 border-b border-slate-100">
                  <span>Layanan</span>
                  <span>Subtotal</span>
                </div>
                {selectedOrder.order_details && selectedOrder.order_details.map(item => (
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
                <span>Rp {parseFloat(selectedOrder.total_harga).toLocaleString('id-ID')}</span>
              </div>

              <div className="text-center text-[10px] text-slate-500 space-y-1 pt-4 border-t-2 border-dashed border-slate-300">
                <p>Terima kasih telah mencuci di LaundryKu.</p>
                <p>Barang yang tidak diambil lebih dari 1 bulan</p>
                <p>di luar tanggung jawab kami.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Global CSS for Animations and Print hide */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .absolute { position: static !important; }
          .print\\:static { position: static !important; }
          .print\\:block { display: block !important; }
          .print\\:hidden { display: none !important; }
          
          /* Only show the modal content */
          .z-50, .z-50 * {
            visibility: visible;
          }
          .z-50 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  )
}
