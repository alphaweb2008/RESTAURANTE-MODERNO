import { useState } from 'react';
import { useStore } from '../store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: Props) {
  const { adminPassword, setAdminLoggedIn } = useStore();
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === adminPassword) {
      setAdminLoggedIn(true);
      setPass('');
      setError(false);
      onClose();
      setTimeout(() => {
        document.getElementById('admin')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-gray-900 border border-slate-700/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl ${error ? 'animate-shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-1">Panel Admin</h3>
        <p className="text-gray-600 text-sm mb-6">Ingresa la contraseña de administrador</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-700 focus:outline-none transition-all text-sm mb-4 ${
              error ? 'border-red-500' : 'border-slate-700/30 focus:border-slate-500/50'
            }`}
          />
          {error && <p className="text-red-400 text-xs mb-3">Contraseña incorrecta</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-white/5 text-gray-500 rounded-xl hover:bg-white/10 transition-all text-sm border border-white/10">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-slate-500 to-slate-700 text-white rounded-xl hover:from-slate-400 hover:to-slate-600 transition-all text-sm font-medium border border-slate-500/30">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
