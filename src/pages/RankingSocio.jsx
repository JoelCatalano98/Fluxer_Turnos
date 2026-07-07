import { useState, useEffect } from 'react';
import clienteAxios from '../api/axios';
import { Trophy, Medal, ChevronRight, Save, Loader2, ArrowLeft } from 'lucide-react';

const EJERCICIOS = ["Press Plano", "Sentadilla", "Peso Muerto", "Dominadas"];

export default function RankingSocio() {
  const [selectedEjercicio, setSelectedEjercicio] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [miPeso, setMiPeso] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getSocioId = () => {
    try {
      const data = localStorage.getItem('socio_data');
      if (data) return JSON.parse(data).id;
      return null;
    } catch {
      return null;
    }
  };

  const clienteId = getSocioId();

  const loadRanking = async (ejercicio) => {
    setLoading(true);
    try {
      const res = await clienteAxios.get(`/ranking?ejercicio=${encodeURIComponent(ejercicio)}`);
      if (res.data.success) {
        setRanking(res.data.data);
      }
      if (clienteId) {
        const myRes = await clienteAxios.get(`/ranking/my-record?clienteId=${clienteId}&ejercicio=${encodeURIComponent(ejercicio)}`);
        if (myRes.data.success && myRes.data.data) {
          setMiPeso(myRes.data.data.pesoMaximo.toString());
        } else {
          setMiPeso('');
        }
      }
    } catch (error) {
      console.error('Error al cargar ranking', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEjercicio = (ej) => {
    setSelectedEjercicio(ej);
    loadRanking(ej);
  };

  const handleSavePeso = async () => {
    if (!miPeso || !clienteId) return;
    setSaving(true);
    try {
      const res = await clienteAxios.post('/ranking', {
        clienteId,
        ejercicio: selectedEjercicio,
        pesoMaximo: parseFloat(miPeso)
      });
      if (res.data.success) {
        loadRanking(selectedEjercicio);
      }
    } catch (error) {
      console.error('Error al guardar peso', error);
      alert('Error al guardar récord');
    } finally {
      setSaving(false);
    }
  };

  const renderMedal = (index) => {
    if (index === 0) return <Medal className="w-5 h-5 text-yellow-500" fill="currentColor" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" fill="currentColor" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" fill="currentColor" />;
    return <span className="w-5 text-center font-bold text-gray-400">{index + 1}</span>;
  };

  if (selectedEjercicio) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 pb-20 relative z-10 animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedEjercicio(null)}
          className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Ejercicios
        </button>
        
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gray-900" /> {selectedEjercicio}
        </h2>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Mi Récord (1RM)</h3>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={miPeso}
              onChange={(e) => setMiPeso(e.target.value)}
              placeholder="Ej: 100"
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
            <button 
              onClick={handleSavePeso}
              disabled={saving || !miPeso}
              className="bg-gray-900 text-white px-4 rounded-lg font-bold flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Top 20 Global</h3>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center p-8 text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm">
            Nadie ha registrado su peso aún. ¡Sé el primero!
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col divide-y divide-gray-100">
            {ranking.map((rec, index) => (
              <div key={rec.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-6 flex justify-center">
                    {renderMedal(index)}
                  </div>
                  <span className="font-semibold text-gray-800">
                    {rec.cliente.nombre} {rec.cliente.apellido}
                  </span>
                </div>
                <span className="font-black text-gray-900 text-lg">{rec.pesoMaximo} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 pb-20 relative z-10">
      <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-gray-900" /> Ranking 1RM
      </h2>
      <p className="text-sm text-gray-500 mb-4">Selecciona un ejercicio para ver el podio o actualizar tu récord personal.</p>
      
      <div className="flex flex-col gap-3">
        {EJERCICIOS.map(ej => (
          <button
            key={ej}
            onClick={() => handleSelectEjercicio(ej)}
            className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left"
          >
            <span className="font-bold text-gray-800">{ej}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
