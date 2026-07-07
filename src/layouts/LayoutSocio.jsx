import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/app/perfil', label: 'Mi Perfil', icon: User },
  { to: '/app/turnos', label: 'Turnos Disponibles', icon: CalendarDays },
  { to: '/app/rutinas', label: 'Mis Rutinas', icon: ListChecks },
  { to: '/app/avisos', label: 'Avisos', icon: Megaphone },
  { to: '/app/calculadora', label: 'Calculadora de %', icon: Calculator },
  { to: '/app/pagos', label: 'Informar Pago', icon: CreditCard },
];

const TITLES = {
  '/app/perfil': 'Mi Perfil',
  '/app/turnos': 'Turnos Disponibles',
  '/app/rutinas': 'Mis Rutinas',
  '/app/avisos': 'Avisos',
  '/app/calculadora': 'Calculadora',
  '/app/pagos': 'Informar Pago',
};

export default function LayoutSocio() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentTitle = TITLES[location.pathname] || 'Fluxer';

  const handleLogout = () => {
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
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
