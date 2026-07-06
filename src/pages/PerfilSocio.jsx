import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, CreditCard, Phone, Save, Lock, ShieldCheck, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/socio/perfil';

export default function PerfilSocio() {
  // Datos del perfil
  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    dni_cuit: '',
    email: '',
    telefono: '',
  });

  // Cambio de contraseña
  const [passwords, setPasswords] = useState({
    passwordActual: '',
    nuevoPassword: '',
  });

  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [msgPerfil, setMsgPerfil] = useState({ text: '', type: '' });
  const [msgPassword, setMsgPassword] = useState({ text: '', type: '' });

  // Obtener ID del socio desde localStorage
  const getSocioId = () => {
    try {
      const data = localStorage.getItem('socio_data');
      if (data) return JSON.parse(data).id;
      return null;
    } catch {
      return null;
    }
  };

  // Cargar perfil al montar
  useEffect(() => {
    const fetchPerfil = async () => {
      const id = getSocioId();
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        if (res.data.success) {
          const d = res.data.data;
          setPerfil({
            nombre: d.nombre || '',
            apellido: d.apellido || '',
            dni_cuit: d.dni_cuit || '',
            email: d.email || '',
            telefono: d.telefono || '',
          });
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  // Guardar datos del perfil
  const handleSavePerfil = async (e) => {
    e.preventDefault();
    setMsgPerfil({ text: '', type: '' });
    setSavingPerfil(true);
    const id = getSocioId();
    try {
      const res = await axios.put(`${API_URL}/${id}`, perfil);
      if (res.data.success) {
        // Actualizar datos en localStorage
        const storedData = JSON.parse(localStorage.getItem('socio_data') || '{}');
        localStorage.setItem('socio_data', JSON.stringify({ ...storedData, ...perfil }));
        setMsgPerfil({ text: '¡Datos actualizados con éxito!', type: 'success' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar datos';
      setMsgPerfil({ text: msg, type: 'error' });
    } finally {
      setSavingPerfil(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsgPassword({ text: '', type: '' });
    setSavingPassword(true);
    const id = getSocioId();
    try {
      const res = await axios.put(`${API_URL}/${id}/password`, passwords);
      if (res.data.success) {
        setMsgPassword({ text: '¡Contraseña actualizada con éxito!', type: 'success' });
        setPasswords({ passwordActual: '', nuevoPassword: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cambiar la contraseña';
      setMsgPassword({ text: msg, type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-8">
      {/* ── Sección 1: Mis Datos ── */}
      <form onSubmit={handleSavePerfil}>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Mis Datos</h2>
          </div>

          {/* Mensaje de feedback */}
          {msgPerfil.text && (
            <div className={`mb-4 p-3 rounded-xl text-sm text-center ${
              msgPerfil.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                : 'bg-red-50 border border-red-200 text-red-500'
            }`}>
              {msgPerfil.text}
            </div>
          )}

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={perfil.nombre}
                  onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Apellido</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={perfil.apellido}
                  onChange={(e) => setPerfil({ ...perfil, apellido: e.target.value })}
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* DNI */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">DNI / CUIT</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={perfil.dni_cuit}
                  onChange={(e) => setPerfil({ ...perfil, dni_cuit: e.target.value })}
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  placeholder="Ej: 12345678"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={perfil.email}
                  onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Celular</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={perfil.telefono}
                  onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  placeholder="+54 9 ..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPerfil}
            className="w-full flex items-center justify-center gap-2 mt-5 p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {savingPerfil ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Sección 2: Seguridad ── */}
      <form onSubmit={handleChangePassword}>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Seguridad</h2>
          </div>

          {/* Mensaje de feedback */}
          {msgPassword.text && (
            <div className={`mb-4 p-3 rounded-xl text-sm text-center ${
              msgPassword.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                : 'bg-red-50 border border-red-200 text-red-500'
            }`}>
              {msgPassword.text}
            </div>
          )}

          <div className="space-y-4">
            {/* Contraseña actual */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Contraseña Actual</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={passwords.passwordActual}
                  onChange={(e) => setPasswords({ ...passwords, passwordActual: e.target.value })}
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={passwords.nuevoPassword}
                  onChange={(e) => setPasswords({ ...passwords, nuevoPassword: e.target.value })}
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full flex items-center justify-center gap-2 mt-5 p-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {savingPassword ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Cambiar Contraseña
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
