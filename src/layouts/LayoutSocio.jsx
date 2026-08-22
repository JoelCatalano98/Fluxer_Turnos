import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import clienteAxios from '../api/axios';
import {
  Menu,
  X,
  CalendarDays,
  ListChecks,
  Megaphone,
  Calculator,
  CreditCard,
  LogOut,
  User,
  Trophy,
  Phone,
  Save,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/app/perfil', label: 'Mi Perfil', icon: User },
  { to: '/app/turnos', label: 'Turnos Disponibles', icon: CalendarDays },
  { to: '/app/rutinas', label: 'Mis Rutinas', icon: ListChecks },
  { to: '/app/avisos', label: 'Avisos', icon: Megaphone },
  { to: '/app/ranking', label: 'Ranking 1RM', icon: Trophy },
  { to: '/app/pagos', label: 'Informar Pago', icon: CreditCard },
];

const TITLES = {
  '/app/perfil': 'Mi Perfil',
  '/app/turnos': 'Turnos Disponibles',
  '/app/rutinas': 'Mis Rutinas',
  '/app/avisos': 'Avisos',
  '/app/ranking': 'Ranking 1RM',
  '/app/pagos': 'Informar Pago',
};

export default function LayoutSocio() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentTitle = TITLES[location.pathname] || 'Fluxer';

  // --- BARRERA DE PERFIL Y AVISOS ---
  const [requireTelefono, setRequireTelefono] = useState(false);
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [socioDataState, setSocioDataState] = useState(null);

  useEffect(() => {
    try {
      const socioData = JSON.parse(localStorage.getItem('socio_data') || '{}');
      if (socioData && socioData.id) {
        setSocioDataState(socioData);
        if (!socioData.telefono || socioData.telefono.trim() === '') {
          setRequireTelefono(true);
        }
      }
    } catch (err) {
      console.error('Error leyendo socio_data', err);
    }
  }, []);

  const handleSaveTelefono = async (e) => {
    e.preventDefault();
    if (!nuevoTelefono || nuevoTelefono.trim() === '') {
      setError('Por favor, ingresa un número de teléfono válido.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const socioDataStr = localStorage.getItem('socio_data');
      if (!socioDataStr) return;
      
      const socioData = JSON.parse(socioDataStr);
      
      // Enviamos el objeto con los datos existentes más el teléfono nuevo,
      // imitando el comportamiento de PerfilSocio.jsx
      const payload = {
        nombre: socioData.nombre || '',
        apellido: socioData.apellido || '',
        dni_cuit: socioData.dni_cuit || '',
        email: socioData.email || '',
        telefono: nuevoTelefono
      };

      const res = await clienteAxios.put(`/socio/perfil/${socioData.id}`, payload);
      
      if (res.data.success) {
        // Actualizar localStorage y quitar la barrera
        const updatedSocio = { ...socioData, telefono: nuevoTelefono };
        localStorage.setItem('socio_data', JSON.stringify(updatedSocio));
        setSocioDataState(updatedSocio);
        setRequireTelefono(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el teléfono. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* ── Modal Bloqueante (Barrera de Teléfono) ── */}
      {requireTelefono && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <Phone className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">¡Ya casi estamos!</h2>
              <p className="text-gray-600 text-sm">
                Para poder gestionar tus reservas y enviarte notificaciones, necesitamos tu número de WhatsApp.
              </p>
              
              <form onSubmit={handleSaveTelefono} className="w-full mt-4 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
                    {error}
                  </div>
                )}
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    placeholder="Ej: +54 9 11 12345678"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar y Continuar
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Aviso de Contraseña Sugerido ── */}
      {socioDataState?.defaultPassword && !requireTelefono && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
          <div className="bg-white/95 backdrop-blur-md border border-amber-200 p-4 rounded-2xl shadow-xl flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-full shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">Seguridad Recomendada</h4>
              <p className="text-xs text-gray-600 mt-1">Estás usando una contraseña temporal o predeterminada. Te sugerimos cambiarla en "Mi Perfil" por tu seguridad.</p>
            </div>
            <button 
              onClick={() => {
                const updated = { ...socioDataState, defaultPassword: false };
                localStorage.setItem('socio_data', JSON.stringify(updated));
                setSocioDataState(updated);
              }} 
              className="p-1 hover:bg-gray-100 rounded-lg shrink-0 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* ── Marca de agua ── */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span
          className="text-[8rem] sm:text-[10rem] font-black text-gray-900/[0.04] tracking-widest"
          style={{ transform: 'rotate(-45deg)' }}
        >
          FLUXER
        </span>
      </div>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 text-gray-900">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold truncate">{currentTitle}</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-900"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ── Overlay ── */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Drawer ── */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-3/4 max-w-xs bg-white text-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-lg font-bold tracking-wide">Menú</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 border-r-4 border-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main className="relative z-10 p-4">
        <Outlet />
      </main>
    </div>
  );
}
