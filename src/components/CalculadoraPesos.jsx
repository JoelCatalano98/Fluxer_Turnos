import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';

export default function CalculadoraPesos({ onClose }) {
  const [pesoBase, setPesoBase] = useState('');
  const [porcentaje, setPorcentaje] = useState('');

  const calcular = () => {
    const pBase = parseFloat(pesoBase);
    const pPorc = parseFloat(porcentaje);
    if (!isNaN(pBase) && !isNaN(pPorc)) {
      return ((pBase * pPorc) / 100).toFixed(2).replace(/\.00$/, '');
    }
    return '0';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gray-700" /> Calculadora %
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Peso Base (1RM) en kg</label>
            <input 
              type="number" 
              value={pesoBase} 
              onChange={(e) => setPesoBase(e.target.value)}
              placeholder="Ej: 100" 
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Porcentaje (%)</label>
            <input 
              type="number" 
              value={porcentaje} 
              onChange={(e) => setPorcentaje(e.target.value)}
              placeholder="Ej: 70" 
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
          </div>

          <div className="mt-2 bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-1">Resultado</span>
            <span className="text-4xl font-black text-gray-900">{calcular()} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
