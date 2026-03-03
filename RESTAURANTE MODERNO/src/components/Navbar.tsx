import { useState, useEffect } from 'react';
import { useStore } from '../store';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { businessName, logoUrl, isAdminLoggedIn, setAdminLoggedIn } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#home', label: 'Inicio' },
    { href: '#menu', label: 'Menú' },
    { href: '#reservar', label: 'Reservar' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#contacto', label: 'Contacto' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/95 backdrop-blur-md shadow-2xl shadow-slate-900/30' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-500/50" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                {businessName.charAt(0)}
              </div>
            )}
            <span className="text-white font-bold text-lg sm:text-xl tracking-wide group-hover:text-slate-300 transition-colors">
              {businessName}
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-gray-400 hover:text-slate-200 transition-colors text-sm uppercase tracking-widest font-medium">
                {l.label}
              </a>
            ))}
            {isAdminLoggedIn && (
              <a href="#admin" className="text-slate-300 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium">
                Admin
              </a>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!isAdminLoggedIn ? (
              <button
                onClick={() => {
                  const event = new CustomEvent('openLogin');
                  window.dispatchEvent(event);
                }}
                className="text-gray-600 hover:text-slate-300 transition-colors p-2"
                title="Admin"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setAdminLoggedIn(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-2 text-xs uppercase tracking-widest"
                title="Cerrar sesión"
              >
                Salir
              </button>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/98 backdrop-blur-xl border-t border-slate-800/50">
          <div className="px-4 py-4 space-y-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-gray-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest"
              >
                {l.label}
              </a>
            ))}
            {isAdminLoggedIn && (
              <a
                href="#admin"
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest"
              >
                Panel Admin
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
