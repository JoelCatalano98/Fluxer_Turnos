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
  const [modalAnotados, setModalAnotados] = useState({ isOpen: false, turnos: [], titulo: '' });
  
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

  const handleCancelar = async (turnoId, horarioId) => {
    setReserving(horarioId);
    try {
      const res = await axios.delete(`${API_URL}/cancelar/${turnoId}`);
      if (res.data.success) {
        setAlertMsg({ type: 'success', text: 'Reserva cancelada con éxito' });
        fetchClases();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al cancelar el turno.';
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
              <div key={horario.id} className="bg-[#121212] border border-gray-800 rounded-xl p-3 shadow-sm relative overflow-hidden flex flex-col">
                
                {/* Acento de color sutil de fondo */}
                <div 
                  className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" 
                  style={{ backgroundColor: catColor }}
                ></div>

                <div className="flex justify-between items-center mb-3 z-10">
                  {/* Rango Horario */}
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-100 tracking-tight leading-none">
                      {formatTime(horario.hora_inicio)} a {formatTime(horario.hora_fin)} hs
                    </span>
                  </div>

                  {/* Etiqueta de la Categoría */}
                  <div className="text-right flex flex-col items-end">
                    <span 
                      className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                      style={{ color: catColor, backgroundColor: `${catColor}15`, borderColor: `${catColor}30` }}
                    >
                      {catNombre}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-2 z-10">
                  <span className="text-[11px] text-gray-400">Cupos: <strong className="text-gray-200">{ocupados}/{cupoMaximo}</strong></span>
                  <button 
                    onClick={() => setModalAnotados({ isOpen: true, turnos: turnosHoy, titulo: catNombre + ' ' + formatTime(horario.hora_inicio) })}
                    className="text-[11px] text-gray-400 hover:text-white underline decoration-gray-700 underline-offset-2 transition-colors cursor-pointer"
                  >
                    Ver anotados ({ocupados})
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[3px] bg-gray-800 rounded-full overflow-hidden mb-3 z-10">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${porcentaje}%`, 
                      backgroundColor: estaLlena ? '#ef4444' : '#d1d5db' 
                    }}
                  ></div>
                </div>

                {/* Botón de Acción */}
                <div className="z-10 mt-auto">
                  {estoyAnotado ? (
                    <button
                      onClick={() => handleCancelar(turnosHoy.find(t => t.clienteId === socioId).id, horario.id)}
                      disabled={isReservingThis}
                      className="w-full py-2 bg-[#1a1a1a] hover:bg-red-900/20 border border-[#2a2a2a] hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-lg font-semibold text-center text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
                    >
                      {isReservingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Cancelar Reserva
                        </>
                      )}
                    </button>
                  ) : estaLlena ? (
                    <button disabled className="w-full py-2 bg-[#161616] border border-[#222] text-gray-600 rounded-lg font-semibold text-xs cursor-not-allowed uppercase tracking-wider">
                      Lleno
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReservar(horario)}
                      disabled={isReservingThis}
                      className="w-full py-2 bg-gray-200 hover:bg-white text-gray-950 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:active:scale-100"
                    >
                      {isReservingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-900" />
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

      {/* Modal Ver Anotados */}
      {modalAnotados.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121212] border border-gray-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]">
              <h3 className="text-gray-100 font-bold text-sm">Anotados - {modalAnotados.titulo}</h3>
              <button 
                onClick={() => setModalAnotados({ isOpen: false, turnos: [], titulo: '' })}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {modalAnotados.turnos.length > 0 ? (
                <ul className="space-y-3">
                  {modalAnotados.turnos.map((t, idx) => {
                    const nombre = t.cliente?.nombre || 'Socio';
                    const apellido = t.cliente?.apellido || '';
                    return (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 font-bold border border-gray-700">
                          {idx + 1}
                        </div>
                        {nombre} {apellido}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No hay inscritos en esta clase aún.</p>
              )}
            </div>
            <div className="p-3 border-t border-gray-800 bg-[#161616]">
              <button 
                onClick={() => setModalAnotados({ isOpen: false, turnos: [], titulo: '' })}
                className="w-full py-2 bg-gray-800 text-gray-300 rounded font-semibold text-xs hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
