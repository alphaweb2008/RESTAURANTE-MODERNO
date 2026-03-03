import { useStore } from '../store';

export default function AboutSection() {
  const { aboutText, aboutImage1, aboutImage2, businessName } = useStore();

  const fallback1 = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80&auto=format&fit=crop';
  const fallback2 = 'https://images.unsplash.com/photo-1559339352-9e88f6f1aad9?w=1200&q=80&auto=format&fit=crop';

  return (
    <section id="sobre" className="py-20 sm:py-28 bg-gray-950 border-t border-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-slate-400 text-sm uppercase tracking-[0.3em] font-medium">Nuestra Historia</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3">Sobre Nosotros</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-slate-500 to-slate-700 mx-auto mt-5 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Galería 2 fotos */}
          <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.05]">
              <img
                src={aboutImage1 || fallback1}
                alt={`${businessName} - foto 1`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.05] mt-6">
              <img
                src={aboutImage2 || fallback2}
                alt={`${businessName} - foto 2`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </div>

          {/* Texto */}
          <div className="order-1 lg:order-2">
            <p className="font-minimal text-gray-300 text-[15px] sm:text-[17px] leading-7 sm:leading-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
              {aboutText && aboutText.trim().length > 0 ? (
                aboutText
              ) : (
                <>
                  Bienvenido a {businessName}. Somos un espacio donde la tarde y la noche se encuentran con la parrilla.
                  Ingredientes frescos, brasa cuidada y un ambiente que invita a quedarse. ¡Te esperamos!
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
