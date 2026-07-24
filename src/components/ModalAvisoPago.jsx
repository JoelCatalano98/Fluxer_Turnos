import { useState } from 'react';
import clienteAxios from '../api/axios';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function ModalAvisoPago({ isOpen, onClose, clienteId }) {
  const [formData, setFormData] = useState({
    monto: '',
    metodoPago: 'TRANSFERENCIA',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const getSocioData = () => {
    try {
      const data = localStorage.getItem('socio_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };
  const socio = getSocioData();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await clienteAxios.post('/pagos', {
        clienteId,
        monto: parseFloat(formData.monto),
        metodoPago: formData.metodoPago,
        concepto: 'Aviso de pago desde app',
        notas: formData.notas,
        estado: 'PENDIENTE'
      });

      if (res.data.success) {
        setFeedback({ type: 'success', text: 'Tu aviso fue enviado y está pendiente de confirmación por el gimnasio.' });
        setTimeout(() => {
          onClose();
          setFeedback(null);
          setFormData({ monto: '', metodoPago: 'TRANSFERENCIA', notas: '' });
        }, 2500);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Error al enviar el aviso de pago.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">💳 Informar Pago</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {feedback && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {feedback.text}
          </div>
        )}

        {/* Badge de Estado de Cuenta / Saldo */}
        {socio && socio.saldo > 0 && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl mb-4 text-sm font-bold flex items-center gap-2">
            <span>💰 Tenés un saldo a favor de: + ${Math.abs(socio.saldo).toFixed(2)}</span>
          </div>
        )}
        {socio && socio.saldo < 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm font-bold flex items-center gap-2">
            <span>⚠️ Saldo pendiente anterior: - ${Math.abs(socio.saldo).toFixed(2)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Monto Abonado ($)</label>
            <input 
              type="number" 
              required 
              min="1"
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
              placeholder="Ej: 30000"
              className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Medio de Pago</label>
            <select 
              value={formData.metodoPago}
              onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            >
              <option value="TRANSFERENCIA">Transferencia / CBU</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
              <option value="EFECTIVO">Efectivo en recepción</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nro. Comprobante o Notas (Opcional)</label>
            <textarea 
              rows="2"
              value={formData.notas}
              onChange={(e) => setFormData({...formData, notas: e.target.value})}
              placeholder="Ej: Transferencia desde Galicia..."
              className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full py-3.5 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 bg-gray-900 hover:bg-black active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enviar Aviso de Pago'}
          </button>
        </form>
      </div>
    </div>
  );
}
