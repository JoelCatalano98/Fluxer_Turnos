import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginSocio from './pages/LoginSocio';
import LayoutSocio from './layouts/LayoutSocio';
import PerfilSocio from './pages/PerfilSocio';
import TurnosSocio from './pages/TurnosSocio';
import RutinasSocio from './pages/RutinasSocio';
import AvisosSocio from './pages/AvisosSocio';

// Páginas temporales (placeholder)
function Calculadora() { return <h2 className="text-xl font-bold text-gray-800">Calculadora de %</h2>; }
function Pagos()       { return <h2 className="text-xl font-bold text-gray-800">Informar Pago</h2>; }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<LoginSocio />} />

        {/* App protegida */}
        <Route path="/app" element={<LayoutSocio />}>
          <Route index element={<Navigate to="turnos" replace />} />
          <Route path="perfil" element={<PerfilSocio />} />
          <Route path="turnos" element={<TurnosSocio />} />
          <Route path="rutinas" element={<RutinasSocio />} />
          <Route path="avisos" element={<AvisosSocio />} />
          <Route path="calculadora" element={<Calculadora />} />
          <Route path="pagos" element={<Pagos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
