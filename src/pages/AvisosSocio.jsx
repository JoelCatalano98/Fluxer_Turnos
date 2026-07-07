import { useState, useEffect } from 'react';
import clienteAxios from '../api/axios';
import { Megaphone, AlertTriangle, Tag, Calendar, Info, Loader2 } from 'lucide-react';

export default function AvisosSocio() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const res = await clienteAxios.get('/socio/avisos');
        if (res.data.success) {
          setAvisos(res.data.data);
        }
      } catch (error) {
        console.error('Error al cargar avisos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvisos();
  }, []);

  const getIconForType = (tipo) => {
    switch (tipo) {
      case 'URGENTE': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'PROMO': return <Tag className="w-5 h-5 text-yellow-500" />;
      case 'FERIADO': return <Calendar className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBadgeClass = (tipo) => {
    switch (tipo) {
      case 'URGENTE': return 'bg-red-50 text-red-600 border-red-100';
      case 'PROMO': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'FERIADO': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Adjusting for timezone to avoid showing previous day
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 relative z-10 pb-20">
      <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
        <Megaphone className="w-6 h-6 text-gray-900" /> Novedades
      </h2>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : avisos.length === 0 ? (
        <div className="text-center p-8 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
          No hay novedades por el momento.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {avisos.map((aviso) => (
            <div key={aviso.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                {getIconForType(aviso.tipo)}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getBadgeClass(aviso.tipo)}`}>
                  {aviso.tipo}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{aviso.titulo}</h3>
              {aviso.mensaje && (
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{aviso.mensaje}</p>
              )}
              <div className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100 uppercase font-semibold">
                Vigencia: Desde {formatDate(aviso.fechaDesde)} {aviso.fechaHasta && `| Hasta ${formatDate(aviso.fechaHasta)}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
