import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Check, Loader2, Dumbbell } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/socio/rutinas';

export default function RutinasSocio() {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  // Estado local para los inputs de peso real
  const [pesosInput, setPesosInput] = useState({});

  useEffect(() => {
    fetchRutinas();
  }, []);

  const getSocioId = () => {
    try {
      const data = localStorage.getItem('socio_data');
      if (data) return JSON.parse(data).id;
      return null;
    } catch {
      return null;
    }
  };

  const fetchRutinas = async () => {
    const clienteId = getSocioId();
    if (!clienteId) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/${clienteId}`);
      if (res.data.success) {
        setRutinas(res.data.data);
        
        // Inicializar el estado de los inputs con los pesos reales que ya vienen de la DB
        const initialPesos = {};
        res.data.data.forEach(rutina => {
          rutina.ejercicios.forEach(ej => {
            if (ej.pesoReal !== null && ej.pesoReal !== undefined) {
              initialPesos[ej.id] = ej.pesoReal;
            } else {
              initialPesos[ej.id] = '';
            }
          });
        });
        setPesosInput(initialPesos);
      }
    } catch (error) {
      console.error('Error al cargar rutinas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarPeso = async (ejercicioId) => {
    const peso = pesosInput[ejercicioId];
    if (peso === '' || peso === null || peso === undefined) return;

    setSavingId(ejercicioId);
    setSuccessId(null);

    try {
      const res = await axios.put(`${API_URL}/ejercicio/${ejercicioId}`, {
        pesoReal: parseFloat(peso)
      });

      if (res.data.success) {
        // Actualizamos localmente el estado de rutinas para que refleje el cambio
        setRutinas(prev => prev.map(rut => ({
          ...rut,
          ejercicios: rut.ejercicios.map(ej => 
            ej.id === ejercicioId ? { ...ej, pesoReal: parseFloat(peso) } : ej
          )
        })));
        
        // Mostrar feedback de éxito temporal
        setSuccessId(ejercicioId);
        setTimeout(() => setSuccessId(null), 2000);
      }
    } catch (error) {
      console.error('Error al actualizar el peso:', error);
      alert('Error al guardar el peso. Intenta nuevamente.');
    } finally {
      setSavingId(null);
    }
  };

  const handleInputChange = (ejercicioId, value) => {
    setPesosInput(prev => ({ ...prev, [ejercicioId]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto relative pb-20 min-h-screen bg-gray-50">
      
      {rutinas.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sin Rutinas</h3>
          <p className="text-sm text-gray-500">
            Aún no tienes rutinas asignadas por tu profesor.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-8">
          {rutinas.map(rutina => (
            <div key={rutina.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                {rutina.nombre}
              </h2>

              <div className="space-y-3">
                {rutina.ejercicios.map(ejercicio => (
                  <div 
                    key={ejercicio.id} 
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col"
                  >
                    {/* Encabezado del Ejercicio */}
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                      {ejercicio.nombreEjercicio}
                    </h3>
                    
                    {/* Detalle Fijo */}
                    <p className="text-sm text-gray-500 font-medium">
                      {ejercicio.series} Series x {ejercicio.repeticiones} Reps
                    </p>

                    {/* Sección de Carga (Interactivo) */}
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mt-3 flex items-center justify-between">
                      
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Sugerido</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {ejercicio.pesoSugerido ? `${ejercicio.pesoSugerido} kg` : '-'}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tu Peso (kg)</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={pesosInput[ejercicio.id] !== undefined ? pesosInput[ejercicio.id] : ''}
                            onChange={(e) => handleInputChange(ejercicio.id, e.target.value)}
                            placeholder="0"
                            className="w-16 p-1.5 text-center text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all shadow-sm"
                          />
                          <button
                            onClick={() => handleActualizarPeso(ejercicio.id)}
                            disabled={savingId === ejercicio.id || pesosInput[ejercicio.id] === ''}
                            className={`p-1.5 rounded-md flex items-center justify-center transition-all duration-200 shadow-sm ${
                              successId === ejercicio.id 
                                ? 'bg-gray-200 text-gray-900 border border-gray-300' 
                                : 'bg-gray-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                            aria-label="Guardar peso"
                          >
                            {savingId === ejercicio.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : successId === ejercicio.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
