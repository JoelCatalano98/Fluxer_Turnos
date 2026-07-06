import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/socio/turnos';

// Helper: Lunes de la semana actual
const getLunes = () => {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

// Formatear hora (UTC a HH:MM)
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function TurnosSocio() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  
  // Día seleccionado (1=Lunes ... 6=Sábado). Por defecto hoy, o lunes si es domingo.
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => {
    let dia = new Date().getDay();
    if (dia === 0) dia = 1; // Si es domingo, mostramos lunes
    return dia;
  });

  // Generar array de la semana actual
  const semana = useMemo(() => {
    const lunes = getLunes();
    const dias = [];
    const nombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      dias.push({
        num: d.getDate(),
        nombre: nombres[i],
        diaSemana: i + 1,
        fechaObj: d, // Objeto fecha para luego reservar
        fechaStr: d.toISOString().split('T')[0] // YYYY-MM-DD
      });
    }
    return dias;
  }, []);

  const getSocioId = () => {
    try {
      const data = localStorage.getItem('socio_data');
      return data ? JSON.parse(data).id : null;
    } catch {
      return null;
    }
  };

  const fetchClases = async () => {
    setLoading(true);
    try {
      // Filtrar por día seleccionado
      const res = await axios.get(`${API_URL}/disponibles?dia_semana=${diaSeleccionado}`);
      if (res.data.success) {
        setClases(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar clases', err);
      setAlertMsg({ type: 'error', text: 'Error de conexión al cargar la grilla.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClases();
  }, [diaSeleccionado]);

  const handleReservar = async (horario) => {
    const clienteId = getSocioId();
    if (!clienteId) {
      setAlertMsg({ type: 'error', text: 'Sesión inválida, vuelve a iniciar sesión.' });
      return;
    }

    setReserving(horario.id);
    try {
      const diaObj = semana.find(d => d.diaSemana === diaSeleccionado);
      
      const res = await axios.post(`${API_URL}/reservar`, {
        horarioId: horario.id,
        clienteId: clienteId,
        fechaExacta: diaObj.fechaStr
      });

      if (res.data.success) {
        setAlertMsg({ type: 'success', text: '¡Turno reservado con éxito!' });
        fetchClases(); 
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al reservar el turno.';
      setAlertMsg({ type: 'error', text: msg });
    } finally {
      setReserving(null);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const socioId = getSocioId();
  const diaActivoObj = semana.find(d => d.diaSemana === diaSeleccionado);

  return (
    <div className="max-w-md mx-auto relative pb-20 min-h-screen bg-gray-950">
      
      {/* Alerta flotante */}
      {alertMsg && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border ${
          alertMsg.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-red-500/20 border-red-500/50 text-red-400'
        } flex items-center gap-2 max-w-[90%] w-max animate-in fade-in slide-in-from-top-5`}>
          {alertMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold text-sm">{alertMsg.text}</span>
        </div>
      )}

      {/* Header & Calendario Carrusel */}
      <div className="bg-gray-900 border-b border-white/5 px-4 pt-6 pb-4 sticky top-0 z-30 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4 tracking-wide">Clases Disponibles</h2>
        
        <div className="flex justify-between items-center overflow-x-auto pb-2 scrollbar-hide gap-2">
          {semana.map(dia => {
            const isSelected = dia.diaSemana === diaSeleccionado;
            return (
              <button
                key={dia.diaSemana}
                onClick={() => setDiaSeleccionado(dia.diaSemana)}
                className={`flex flex-col items-center justify-center min-w-[50px] h-16 rounded-2xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className={`text-xs font-semibold uppercase mb-1 ${isSelected ? 'text-emerald-50' : 'text-gray-400'}`}>
                  {dia.nombre}
                </span>
                <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                  {dia.num}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Horarios */}
      <div className="px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="mt-3 text-emerald-400/80 font-medium text-sm">Cargando horarios...</p>
          </div>
        ) : clases.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center">
            <Clock className="w-12 h-12 text-gray-600 mb-3" />
            <h3 className="text-gray-300 font-medium mb-1">Sin actividades</h3>
            <p className="text-gray-500 text-sm">No hay clases programadas para este día.</p>
          </div>
        ) : (
          clases.map(horario => {
            // Filtrar turnos del día activo
            const turnosHoy = horario.turnos?.filter(t => t.fecha.startsWith(diaActivoObj.fechaStr)) || [];
            const ocupados = turnosHoy.length;
            const cupoMaximo = horario.cupoMaximo || 15;
            const porcentaje = Math.min((ocupados / cupoMaximo) * 100, 100);
            
            const estaLlena = ocupados >= cupoMaximo;
            const isReservingThis = reserving === horario.id;
            const estoyAnotado = turnosHoy.some(t => t.clienteId === socioId);
            
            const catNombre = horario.categoria?.nombre || 'General';
            const catColor = horario.categoria?.color || '#10b981';

            return (
              <div key={horario.id} className="bg-[#1c1c1e] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col">
                
                {/* Acento de color sutil de fondo */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" 
                  style={{ backgroundColor: catColor }}
                ></div>

                <div className="flex justify-between items-center mb-5 z-10">
                  {/* Hora grande a la izquierda */}
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-white tracking-tighter leading-none">
                      {formatTime(horario.hora_inicio)}
                    </span>
                    <span className="text-sm font-semibold text-gray-500 mt-1">
                      hasta {formatTime(horario.hora_fin)} hs
                    </span>
                  </div>

                  {/* Nombre de la Categoría y Cupos */}
                  <div className="text-right flex flex-col items-end">
                    <span 
                      className="text-xs font-bold uppercase tracking-widest mb-1 px-2 py-0.5 rounded-md"
                      style={{ color: catColor, backgroundColor: `${catColor}15` }}
                    >
                      {catNombre}
                    </span>
                    <span className="text-sm font-semibold text-gray-400">
                      {ocupados} / {cupoMaximo}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-5 z-10">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${porcentaje}%`, 
                      backgroundColor: estaLlena ? '#ef4444' : catColor 
                    }}
                  ></div>
                </div>

                {/* Lista de Anotados */}
                <div className="z-10 mb-5 bg-black/20 rounded-xl p-3 border border-white/5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Anotados</h4>
                  {turnosHoy.length > 0 ? (
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {turnosHoy.map(t => {
                        const nombre = t.cliente?.nombre || 'Socio';
                        const apellido = t.cliente?.apellido || '';
                        return `${nombre} ${apellido ? apellido.charAt(0) + '.' : ''}`;
                      }).join(', ')}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Sé el primero en anotarte</div>
                  )}
                </div>

                {/* Botón de Acción */}
                <div className="z-10">
                  {estoyAnotado ? (
                    <div className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-bold text-center text-sm flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Anotado
                    </div>
                  ) : estaLlena ? (
                    <button disabled className="w-full py-3.5 bg-gray-800 text-gray-500 rounded-2xl font-bold text-sm cursor-not-allowed uppercase tracking-wider">
                      Lista de Espera
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReservar(horario)}
                      disabled={isReservingThis}
                      className="w-full py-3.5 bg-gray-100 hover:bg-white text-gray-900 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                    >
                      {isReservingThis ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                      ) : (
                        'Anotarme'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
