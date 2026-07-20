import { useState } from 'react';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import ModalAvisoPago from '../components/ModalAvisoPago';

export default function SuscripcionSocio() {
  const [mostrarModalPago, setMostrarModalPago] = useState(false);

  const getSocioData = () => {
    try {
      const data = localStorage.getItem('socio_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const socio = getSocioData();
  const socioId = socio?.id || null;
  const vencimiento = socio?.vencimientoCuota ? new Date(socio.vencimientoCuota) : null;
  const estaVencido = socio?.estado_pago === 'MOROSO'
    || (vencimiento ? vencimiento < new Date() : true);

  const formatFecha = (date) => {
    if (!date) return '—';
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-8">

      {/* Estado de la Suscripción */}
      <div className={`rounded-2xl p-5 shadow-sm border ${
        estaVencido 
          ? 'bg-red-50 border-red-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start gap-3">
          {estaVencido ? (
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h3 className={`text-lg font-bold ${estaVencido ? 'text-red-800' : 'text-green-800'}`}>
              {estaVencido ? '⚠️ Tu cuota está vencida' : '✅ Tu cuota está al día'}
            </h3>
            <p className={`text-sm mt-1 ${estaVencido ? 'text-red-700' : 'text-green-700'}`}>
              {estaVencido 
                ? 'Informá tu pago para volver a reservar turnos.' 
                : `Tu cuota está al día hasta el ${formatFecha(vencimiento)}.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Acción Principal */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 border border-gray-200">
            <CreditCard className="w-5 h-5 text-gray-900" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Informar Pago</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          ¿Ya realizaste tu transferencia o pago? Avisanos para que el gimnasio confirme tu cuota y mantengas tus reservas habilitadas.
        </p>
        <button 
          onClick={() => setMostrarModalPago(true)}
          className={`w-full flex items-center justify-center gap-2 p-3.5 font-bold rounded-xl transition-all active:scale-95 text-sm ${
            estaVencido
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
              : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900'
          }`}
        >
          💳 Informar Pago
        </button>
      </div>

      {/* Info adicional */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h4 className="text-sm font-bold text-gray-700 mb-3">¿Cómo funciona?</h4>
        <ol className="space-y-2 text-sm text-gray-500">
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            Realizás tu pago por transferencia, Mercado Pago o efectivo.
          </li>
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            Tocás "Informar Pago" y completás el formulario con el monto y medio de pago.
          </li>
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            El gimnasio recibe tu aviso y lo aprueba. ¡Tu cuota queda al día!
          </li>
        </ol>
      </div>

      {mostrarModalPago && (
        <ModalAvisoPago 
          isOpen={mostrarModalPago} 
          onClose={() => setMostrarModalPago(false)} 
          clienteId={socioId} 
        />
      )}
    </div>
  );
}
