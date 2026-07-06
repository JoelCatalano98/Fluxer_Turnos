import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, UserPlus, Zap, User, CreditCard, ArrowRightLeft } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/socio/auth';

export default function LoginSocio() {
  const navigate = useNavigate();

  // Estado dual: login o registro
  const [isLogin, setIsLogin] = useState(true);

  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dniCuit, setDniCuit] = useState('');

  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // ── Login ──
        const res = await axios.post(`${API_URL}/login`, { email, password });
        // Guardar token y datos del usuario en localStorage
        localStorage.setItem('socio_token', res.data.data.token);
        localStorage.setItem('socio_data', JSON.stringify(res.data.data.cliente));
        // Navegar a la app
        navigate('/app');
      } else {
        // ── Registro ──
        await axios.post(`${API_URL}/register`, {
          nombre,
          apellido,
          dni_cuit: dniCuit,
          email,
          password,
        });
        // Registro exitoso: cambiar a login
        setSuccess('¡Cuenta creada con éxito! Ahora iniciá sesión.');
        setIsLogin(true);
        // Limpiar campos de registro
        setNombre('');
        setApellido('');
        setDniCuit('');
        setPassword('');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Ocurrió un error. Intentá de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 mb-4 shadow-lg shadow-emerald-500/25">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            FLUXER
          </h1>
          <p className="text-gray-400 text-sm mt-1">Portal de Socios</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>

          {/* Mensajes de feedback */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center">
              {success}
            </div>
          )}

          {/* ── Campos de Registro ── */}
          {!isLogin && (
            <>
              {/* Nombre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    className="w-full pl-11 p-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Apellido */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                    required
                    className="w-full pl-11 p-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* DNI / CUIT */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  DNI / CUIT
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={dniCuit}
                    onChange={(e) => setDniCuit(e.target.value)}
                    placeholder="Ej: 12345678"
                    required
                    className="w-full pl-11 p-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Email (siempre visible) ── */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full pl-11 p-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* ── Password (siempre visible) ── */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 p-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Ingresar
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Crear Cuenta
              </>
            )}
          </button>

          {/* Toggle Login / Registro */}
          <button
            type="button"
            onClick={toggleMode}
            className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {isLogin
              ? '¿No tenés cuenta? Registrate'
              : '¿Ya tenés cuenta? Iniciá Sesión'}
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            © {new Date().getFullYear()} Fluxer · Todos los derechos reservados
          </p>
        </form>
      </div>
    </div>
  );
}
