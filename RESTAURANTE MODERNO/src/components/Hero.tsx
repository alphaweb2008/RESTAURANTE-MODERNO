import { useStore } from '../store';

export default function Hero() {
  const { businessName, slogan } = useStore();

  return (
    <section id="home" className="relative min-h-screen flex items-end sm:items-center justify-center overflow-hidden pb-24 sm:pb-0">

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80"
          alt="Restaurante"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&q=80';
          }}
        />
        {/* Overlay oscuro con toque plateado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
        {/* Sutil toque plateado */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-transparent" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 sm:pt-28">

        {/* Badge superior eliminado */}

        {/* Nombre del restaurante */}
        <h1 className="text-4xl sm:text-7xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight break-words drop-shadow-2xl">
          {businessName}
        </h1>

        {/* Línea decorativa plateada */}
        <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-400" />
          <span className="text-slate-400 text-lg">✦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-400" />
        </div>

        {slogan && (
          <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            {slogan}
          </p>
        )}

        {/* Horarios */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-slate-600/40 rounded-full px-5 py-2.5 sm:px-6 sm:py-3 hover:border-slate-400/60 transition-all">
            <span>🔥</span>
            <span className="text-gray-300 text-xs sm:text-sm">Asados: 18:00 – 23:00</span>
          </div>
        </div>

        {/* Botones CTA con colores plateados */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href="#menu"
            className="w-full sm:w-auto text-center px-8 py-3.5 sm:py-4 bg-gradient-to-r from-slate-500 to-slate-700 text-white font-semibold rounded-full hover:from-slate-400 hover:to-slate-600 transition-all shadow-lg shadow-slate-700/30 hover:shadow-slate-500/40 hover:scale-105 text-sm uppercase tracking-widest border border-slate-500/30"
          >
            🍽️ Ver Menú
          </a>
          <a
            href="#reservar"
            className="w-full sm:w-auto text-center px-8 py-3.5 sm:py-4 bg-black/40 backdrop-blur-sm border border-slate-600/40 text-white font-semibold rounded-full hover:bg-slate-800/40 hover:border-slate-400/50 transition-all hover:scale-105 text-sm uppercase tracking-widest"
          >
            📅 Reservar Mesa
          </a>
        </div>
      </div>

      

    </section>
  );
}
