import { useState, useEffect } from 'react';
import clienteAxios from '../api/axios';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
  
  const [semana, setSemana] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [socio, setSocio] = useState(() => {
    try {
      const data = localStorage.getItem('socio_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const getSocioData = () => {
    try {
      const data = localStorage.getItem('socio_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const getSocioId = () => {
    return socio ? socio.id : null;
  };
  const estaVencido = socio?.estado_pago === 'MOROSO'
    || (socio?.vencimientoCuota ? new Date(socio.vencimientoCuota) < new Date() : true);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('socio_token')}` }
  });

  useEffect(() => {
    const initConfig = async () => {
      try {
        // Mata-Caché silencioso
        if (socio?.id) {
          clienteAxios.get(`/socio/perfil/${socio.id}`, getAuthHeaders()).then(resSocio => {
            if (resSocio.data.success) {
              setSocio(resSocio.data.data);
              localStorage.setItem('socio_data', JSON.stringify(resSocio.data.data));
            }
          }).catch(err => console.error('Error al actualizar caché del socio:', err));
        }

        const res = await clienteAxios.get('/configuracion', getAuthHeaders());
        const configData = res.data.data || {};
        const stringDias = configData.diasApertura || '1,2,3,4,5,6';
        const validos = stringDias.split(',').map(Number);

        const hoy = new Date();
        // Evitar bug de medianoche forzando la hora a medio día local
        hoy.setHours(12, 0, 0, 0);

        const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dias = [];
        let fechaIteracion = new Date(hoy);
        let intentos = 0;
        
        // Mostrar próximos 7 días hábiles
        while (dias.length < 7 && intentos < 30) {
          if (validos.includes(fechaIteracion.getDay())) {
            const y = fechaIteracion.getFullYear();
            const m = String(fechaIteracion.getMonth() + 1).padStart(2, '0');
            const dStr = String(fechaIteracion.getDate()).padStart(2, '0');
            
            dias.push({
              num: fechaIteracion.getDate(),
              nombre: nombres[fechaIteracion.getDay()],
              diaSemana: fechaIteracion.getDay(),
              fechaObj: new Date(fechaIteracion),
              fechaStr: `${y}-${m}-${dStr}`
            });
          }
          fechaIteracion.setDate(fechaIteracion.getDate() + 1);
          intentos++;
        }
        
        setSemana(dias);
        if (dias.length > 0) {
          setFechaSeleccionada(dias[0].fechaStr);
        }
      } catch (err) {
        console.error('Error al cargar config:', err);
        // Fallback: construir la semana con días por defecto (Lun-Sáb)
        const fallbackDias = [1, 2, 3, 4, 5, 6];
        const hoy = new Date();
        hoy.setHours(12, 0, 0, 0);
        const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dias = [];
        let fechaIteracion = new Date(hoy);
        let intentos = 0;
        while (dias.length < 7 && intentos < 30) {
          if (fallbackDias.includes(fechaIteracion.getDay())) {
            const y = fechaIteracion.getFullYear();
            const m = String(fechaIteracion.getMonth() + 1).padStart(2, '0');
            const dStr = String(fechaIteracion.getDate()).padStart(2, '0');
            dias.push({
              num: fechaIteracion.getDate(),
              nombre: nombres[fechaIteracion.getDay()],
              diaSemana: fechaIteracion.getDay(),
              fechaObj: new Date(fechaIteracion),
              fechaStr: `${y}-${m}-${dStr}`
            });
          }
          fechaIteracion.setDate(fechaIteracion.getDate() + 1);
          intentos++;
        }
        setSemana(dias);
        if (dias.length > 0) {
          setFechaSeleccionada(dias[0].fechaStr);
        }
      } finally {
        setLoading(false);
      }
    };
    initConfig();
  }, []);

  const fetchClases = async () => {
    if (!fechaSeleccionada || semana.length === 0) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const diaActivo = semana.find(d => d.fechaStr === fechaSeleccionada);
      if (!diaActivo) { 
        setLoading(false); 
        return; 
      }
      
      const res = await clienteAxios.get(`/socio/turnos/disponibles?dia_semana=${diaActivo.diaSemana}&fecha=${diaActivo.fechaStr}`, getAuthHeaders());
      if (res.data.success) {
        console.log("🛠️ DEBUG SOCIO:", socio);
        console.log("🛠️ DEBUG CLASES CRUDAS:", res.data.data);

        const socioCatId = socio?.categoriaId || socio?.categoria?.id;
        console.log("🛠️ DEBUG SOCIO CATEGORIA_ID:", socioCatId);

        if (!socioCatId) {
          console.warn("⚠️ El socio no tiene categoriaId asignada. Mostrando todo por fallback.");
          setClases(res.data.data);
        } else {
          const catSocio = Number(socioCatId);
          const clasesFiltradas = res.data.data.filter(c => Number(c.categoriaId) === catSocio);
          setClases(clasesFiltradas);
        }
      }
    } catch (err) {
      console.error('Error al cargar clases', err);
      setAlertMsg({ type: 'error', text: 'Error de conexión al cargar la grilla.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fechaSeleccionada && semana.length > 0) {
      fetchClases();
    }
  }, [fechaSeleccionada, semana, socio?.categoriaId, socio?.categoria?.id]);

  const handleReservar = async (horario) => {
    if (estaVencido) return;
    const clienteId = getSocioId();
    if (!clienteId) {
      setAlertMsg({ type: 'error', text: 'Sesión inválida, vuelve a iniciar sesión.' });
      return;
    }

    setReserving(horario.id);
    try {
      const diaObj = semana.find(d => d.fechaStr === fechaSeleccionada);
      
      const res = await clienteAxios.post(`/socio/turnos/reservar`, {
        horarioId: horario.id,
        clienteId: clienteId,
        fechaExacta: diaObj.fechaStr
      }, getAuthHeaders());

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
      const res = await clienteAxios.delete(`/socio/turnos/cancelar/${turnoId}`, getAuthHeaders());
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
  const diaActivoObj = semana.find(d => d.fechaStr === fechaSeleccionada);

  return (
    <div className="max-w-md mx-auto relative pb-20 min-h-screen bg-gray-50">
      
      {/* Alerta flotante */}
      {alertMsg && (
        <div className={`fixed bottom-10 left-4 right-4 z-[10000] p-4 rounded-xl shadow-2xl text-center font-bold ${
          alertMsg.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        } flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-5`}>
          {alertMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Header & Calendario Carrusel */}
      <div className="bg-white border-b border-gray-200 px-4 pt-6 pb-4 sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-wide">Clases Disponibles</h2>
        </div>
        
        <div className="flex justify-between items-center overflow-x-auto pb-2 scrollbar-hide gap-2">
          {semana.map(dia => {
            const isSelected = dia.fechaStr === fechaSeleccionada;
            return (
              <button
                key={dia.fechaStr}
                onClick={() => setFechaSeleccionada(dia.fechaStr)}
                className={`flex flex-col items-center justify-center min-w-[50px] h-16 rounded-2xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-gray-900 shadow-md shadow-gray-900/20' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className={`text-xs font-semibold uppercase mb-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                  {dia.nombre}
                </span>
                <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {dia.num}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Horarios */}
      <div className="grid grid-cols-2 gap-3 p-3">
        {loading ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
            <p className="mt-3 text-gray-600 font-medium text-sm">Cargando horarios...</p>
          </div>
        ) : clases.length === 0 ? (
          <div className="col-span-2 bg-white border border-gray-200 rounded-3xl p-10 text-center flex flex-col items-center shadow-sm mt-4">
            <Clock className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-gray-900 font-bold mb-1">Sin actividades</h3>
            <p className="text-gray-500 text-sm">No hay clases de tu disciplina programadas para hoy.</p>
          </div>
        ) : (
          clases.map(horario => {
            const turnosHoy = diaActivoObj
              ? (horario.turnos?.filter(t => t.fecha.startsWith(diaActivoObj.fechaStr)) || [])
              : [];
            const ocupados = turnosHoy.length;
            const cupoMaximo = horario.cupoMaximo || 15;
            
            const estaLlena = ocupados >= cupoMaximo;
            const isReservingThis = reserving === horario.id;
            const estoyAnotado = turnosHoy.some(t => t.clienteId === socioId);
            
            const catNombre = horario.categoria?.nombre || 'General';

            // Si está vencido Y no está ya anotado, el botón queda deshabilitado
            const bloqueadoPorDeuda = estaVencido && !estoyAnotado;

            return (
              <div key={horario.id} className="flex flex-col h-full justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-3 relative overflow-hidden">
                
                <div className="z-10 flex flex-col">
                  <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
                    {formatTime(horario.hora_inicio)}
                  </span>
                  
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                    {catNombre}
                  </span>

                  <span className="text-xs text-gray-500 mt-2">
                    {ocupados}/{cupoMaximo} lugares
                  </span>
                  
                  <button 
                    onClick={() => setModalAnotados({ isOpen: true, turnos: turnosHoy, titulo: catNombre + ' ' + formatTime(horario.hora_inicio) })}
                    className="text-left text-[11px] text-gray-900 hover:text-black underline underline-offset-2 mt-1 w-max font-semibold"
                  >
                    Ver anotados ({ocupados})
                  </button>
                </div>

                {/* Botón de Acción */}
                <div className="z-10 mt-3 pt-3 border-t border-gray-100">
                  {estoyAnotado ? (
                    <button
                      onClick={() => handleCancelar(turnosHoy.find(t => t.clienteId === socioId).id, horario.id)}
                      disabled={isReservingThis}
                      className="w-full py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
                    >
                      {isReservingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Cancelar</>
                      )}
                    </button>
                  ) : estaLlena ? (
                    <button disabled className="w-full py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed">
                      Lleno
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReservar(horario)}
                      disabled={isReservingThis || bloqueadoPorDeuda}
                      className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        bloqueadoPorDeuda
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-gray-900 text-white hover:bg-black active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100'
                      }`}
                    >
                      {isReservingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : bloqueadoPorDeuda ? (
                        'Anotarme'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-5 w-3/4 max-w-sm shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 font-bold text-sm">Anotados - {modalAnotados.titulo}</h3>
              <button 
                onClick={() => setModalAnotados({ isOpen: false, turnos: [], titulo: '' })}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto">
              {modalAnotados.turnos.length > 0 ? (
                <ul className="space-y-3">
                  {modalAnotados.turnos.map((t, idx) => (
                    <li key={t.id || idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs border border-gray-200">
                        {t.cliente?.nombre?.charAt(0) || 'U'}
                      </div>
                      <span className="text-gray-700 text-sm font-medium">
                        {t.cliente ? `${t.cliente.nombre} ${t.cliente.apellido}` : 'Usuario'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center text-sm py-4">Nadie anotado aún.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
