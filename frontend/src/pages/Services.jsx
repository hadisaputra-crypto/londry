import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'

export default function Services() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({
    nama_layanan: '',
    jenis_layanan: 'kiloan',
    harga_per_unit: '',
    satuan_unit: 'kg'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/services')
      setServices(data)
    } catch (error) {
      console.error('Gagal mengambil data layanan:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const openModal = (service = null) => {
    if (service) {
      setEditingId(service.id)
      setFormData({
        nama_layanan: service.nama_layanan,
        jenis_layanan: service.jenis_layanan,
        harga_per_unit: service.harga_per_unit,
        satuan_unit: service.satuan_unit
      })
    } else {
      setEditingId(null)
      setFormData({
        nama_layanan: '',
        jenis_layanan: 'kiloan',
        harga_per_unit: '',
        satuan_unit: 'kg'
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
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      if (name === 'jenis_layanan') {
        newData.satuan_unit = value === 'kiloan' ? 'kg' : 'pcs'
      }
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, formData)
      } else {
        await api.post('/services', formData)
      }
      await fetchServices()
      closeModal()
    } catch (error) {
      console.error('Gagal menyimpan layanan:', error)
      alert('Terjadi kesalahan saat menyimpan data.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus layanan ini?')) {
      try {
        await api.delete(`/services/${id}`)
        await fetchServices()
      } catch (error) {
        console.error('Gagal menghapus layanan:', error)
        alert('Gagal menghapus data layanan.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#1875c0] text-white shadow-md">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <button 
            onClick={() => navigate('/laundry-dashboard')}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-lg font-bold tracking-tight flex-1">Pengaturan Layanan</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <button
          onClick={() => openModal()}
          className="w-full bg-[#1875c0] text-white font-semibold py-3.5 rounded-xl shadow-[0_4px_12px_rgba(24,117,192,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Layanan Baru
        </button>

        {loading ? (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-[#1875c0]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-100 shadow-sm">
            Belum ada data layanan.
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(service => (
              <div key={service.id} className="bg-white p-4 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{service.nama_layanan}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase ${service.jenis_layanan === 'kiloan' ? 'bg-[#f48425]/10 text-[#f48425]' : 'bg-[#409b4f]/10 text-[#409b4f]'}`}>
                      {service.jenis_layanan}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-[#1875c0]">
                      Rp{parseFloat(service.harga_per_unit).toLocaleString('id-ID')} <span className="text-slate-400 font-normal">/{service.satuan_unit}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(service)} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 rounded-lg active:bg-slate-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg active:bg-red-50 transition-colors">
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
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Layanan' : 'Layanan Baru'}</h2>
              <button onClick={closeModal} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Layanan</label>
                <input
                  type="text"
                  name="nama_layanan"
                  required
                  value={formData.nama_layanan}
                  onChange={handleInputChange}
                  placeholder="Misal: Cuci Karpet Besar"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis</label>
                  <select
                    name="jenis_layanan"
                    value={formData.jenis_layanan}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                  >
                    <option value="kiloan">Kiloan</option>
                    <option value="satuan">Satuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Satuan Unit</label>
                  <input
                    type="text"
                    name="satuan_unit"
                    required
                    value={formData.satuan_unit}
                    onChange={handleInputChange}
                    placeholder="kg, pcs, meter"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Harga per Unit (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">Rp</span>
                  <input
                    type="number"
                    name="harga_per_unit"
                    required
                    min="0"
                    value={formData.harga_per_unit}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1875c0]/20 focus:border-[#1875c0]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1875c0] text-white font-semibold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-transform disabled:opacity-70 mt-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Layanan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  )
}
