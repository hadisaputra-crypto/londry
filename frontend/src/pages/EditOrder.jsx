import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

export default function EditOrder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()
  const homeRoute = user?.role === 'kasir' ? '/cashier-dashboard' : '/laundry-dashboard'
  
  // Data Master
  const [members, setMembers] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [selectedMember, setSelectedMember] = useState('') // '' = Umum
  const [orderItems, setOrderItems] = useState([
    { id: Date.now(), service_id: '', qty: 1, subtotal: 0 }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Ambil Data Master & Order saat komponen dimuat
  useEffect(() => {
    async function fetchData() {
      try {
        const [membersRes, servicesRes, orderRes] = await Promise.all([
          api.get('/members'),
          api.get('/services'),
          api.get(`/orders/${id}`)
        ])
        setMembers(membersRes.data)
        setServices(servicesRes.data)

        const order = orderRes.data.data
        setSelectedMember(order.member_id || '')
        if (order.order_details && order.order_details.length > 0) {
          setOrderItems(order.order_details.map(item => ({
            id: item.id,
            service_id: item.service_id.toString(),
            qty: parseFloat(item.qty),
            subtotal: parseFloat(item.subtotal)
          })))
        }
      } catch (error) {
        console.error('Gagal mengambil data master atau order:', error)
        alert('Gagal memuat data order.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Handler untuk menambah item layanan baru
  const addOrderItem = () => {
    setOrderItems([...orderItems, { id: Date.now(), service_id: '', qty: 1, subtotal: 0 }])
  }

  // Handler untuk menghapus item layanan
  const removeOrderItem = (idToRemove) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== idToRemove))
    }
  }

  // Handler saat layanan atau qty berubah
  const handleItemChange = (id, field, value) => {
    setOrderItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Jika mengubah service_id, hitung subtotal berdasarkan harga layanan tersebut
        if (field === 'service_id') {
          const service = services.find(s => s.id.toString() === value)
          updatedItem.subtotal = service ? service.harga_per_unit * updatedItem.qty : 0
        }
        
        // Jika mengubah qty, hitung ulang subtotal
        if (field === 'qty') {
          const service = services.find(s => s.id.toString() === item.service_id)
          updatedItem.subtotal = service ? service.harga_per_unit * value : 0
        }
        
        return updatedItem
      }
      return item
    }))
  }

  // Menghitung Grand Total
  const grandTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validasi
    const invalidItems = orderItems.filter(item => !item.service_id || item.qty <= 0)
    if (invalidItems.length > 0) {
      alert('Mohon lengkapi semua pilihan layanan dan pastikan jumlah (qty) valid.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      member_id: selectedMember || null,
      items: orderItems.map(item => ({
        service_id: item.service_id,
        qty: parseFloat(item.qty),
        subtotal: item.subtotal
      })),
      total_harga: grandTotal
    }

    try {
      await api.put(`/orders/${id}`, payload)
      alert('Order berhasil diperbarui!')
      navigate('/orders')
    } catch (error) {
      console.error('Gagal menyimpan order:', error)
      alert('Terjadi kesalahan saat menyimpan order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28 font-sans relative">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate(homeRoute)}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Edit Order</h1>
            <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5 uppercase tracking-wider">
              {user?.nama_laundry || 'LaundryKu'}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        
        {/* 1. Pilih Pelanggan */}
        <section className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-700">Data Pelanggan</h2>
          </div>
          
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">-- Bukan Member / Umum --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.nama} {m.nomor_hp ? `(${m.nomor_hp})` : ''}</option>
            ))}
          </select>
        </section>

        {/* 2. Pilih Layanan (Multi-Services) */}
        <section className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-slate-700">Daftar Cucian</h2>
            </div>
            
            <button
              type="button"
              onClick={addOrderItem}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg active:bg-indigo-100"
            >
              + Tambah
            </button>
          </div>

          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={item.id} className="relative p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                {orderItems.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeOrderItem(item.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pilih Layanan</label>
                    <select
                      required
                      value={item.service_id}
                      onChange={(e) => handleItemChange(item.id, 'service_id', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="" disabled>-- Pilih Jenis Layanan --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nama_layanan} - Rp{parseFloat(s.harga_per_unit).toLocaleString('id-ID')} / {s.satuan_unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-1/3">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Jumlah (Qty)</label>
                      <input
                        type="number"
                        required
                        min="0.1"
                        step="0.1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                    <div className="w-2/3">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subtotal</label>
                      <div className="w-full p-3 bg-slate-100 border border-slate-100 rounded-lg text-sm font-bold text-slate-700 text-right">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </form>

      {/* 3. Kalkulator & Action Button (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-40">
        <div className="flex items-end justify-between mb-3 px-1">
          <span className="text-sm font-semibold text-slate-500">Total Tagihan</span>
          <span className="text-2xl font-bold text-indigo-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || grandTotal === 0}
          className="w-full bg-[#1875c0] hover:bg-[#15609e] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1875c0]/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
             <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
             </svg>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Update Order
            </>
          )}
        </button>
      </div>
    </div>
  )
}
