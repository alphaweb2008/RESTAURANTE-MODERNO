import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import ReservationForm from './components/ReservationForm';
import ContactSection from './components/ContactSection';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import AboutSection from './components/AboutSection';
import { useStore } from './store';

export default function App() {
  const { isAdminLoggedIn, loading, initFirebase, logoUrl, businessName } = useStore();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    initFirebase();
  }, [initFirebase]);

  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener('openLogin', handler);
    return () => window.removeEventListener('openLogin', handler);
  }, []);

  // Actualizar el ícono de la PWA y favicon con el logo del admin
  useEffect(() => {
    if (!logoUrl) return;

    // Actualizar favicon
    const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (existingFavicon) {
      existingFavicon.href = logoUrl;
    }

    const existingShortcut = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
    if (existingShortcut) {
      existingShortcut.href = logoUrl;
    }

    // Actualizar apple-touch-icon
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (appleIcon) {
      appleIcon.href = logoUrl;
    }

    // Actualizar el manifest dinámicamente para la PWA
    const dynamicManifest = {
      name: businessName || 'Restaurante',
      short_name: businessName,
      description: businessName || 'Restaurante',
      start_url: '/',
      display: 'standalone' as const,
      background_color: '#0a0a0f',
      theme_color: '#1a1a2e',
      orientation: 'portrait-primary',
      icons: [
        {
          src: logoUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: logoUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };

    const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    const existingManifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (existingManifest) {
      existingManifest.href = manifestUrl;
    }

    // Actualizar el título de la página
    document.title = businessName || 'Restaurante';

    return () => {
      URL.revokeObjectURL(manifestUrl);
    };
  }, [logoUrl, businessName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700/30 border-t-slate-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Hero />
      <MenuSection />
      <ReservationForm />
      <AboutSection />
      {isAdminLoggedIn && <AdminPanel />}
      <ContactSection />

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.04] bg-black/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} — Todos los derechos reservados
          </p>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
