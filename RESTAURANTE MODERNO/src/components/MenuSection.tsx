import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import type { OrderItem } from '../types';

export default function MenuSection() {
  const { menuItems, addOrder, businessName } = useStore();
  const [filter, setFilter] = useState<string>('todos');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'llevar' | 'local'>('local');
  const [notes, setNotes] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [addedId, setAddedId] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = menuItems.filter((i: any) => i.available !== false && (filter === 'todos' || i.category === filter));

  const addToCart = (item: any) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image || '' }];
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(''), 1500);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 800);
    setShowTooltip(true);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setShowTooltip(false), 4000);
  };

  useEffect(() => {
    return () => { if (tooltipTimer.current) clearTimeout(tooltipTimer.current); };
  }, []);

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));
  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const newQty = c.quantity + delta;
      return newQty <= 0 ? c : { ...c, quantity: newQty };
    }).filter((c) => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const sendOrder = async () => {
    if (!customerName.trim()) { alert('Por favor ingresa tu nombre'); return; }
    if (orderType === 'llevar' && !customerPhone.trim()) { alert('Por favor ingresa tu teléfono'); return; }
    if (cart.length === 0) return;
    await addOrder({
      items: cart,
      total: cartTotal,
      customerName: customerName.trim(),
      customerPhone: orderType === 'llevar' ? customerPhone.trim() : '',
      orderType,
      notes: notes.trim(),
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    });
    setCart([]); setCustomerName(''); setCustomerPhone(''); setNotes('');
    setOrderType('local'); setShowForm(false); setCartOpen(false);
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 4000);
  };

  const getCategoryBadge = (category: string) => {
    if (category === 'entrada') return { label: '🥗 Entrada', bg: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' };
    if (category === 'noche') return { label: '🔥 Asados', bg: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' };
    if (category === 'postres') return { label: '🍰 Postres', bg: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/30' };
    if (category === 'bebidas') return { label: '🍹 Bebidas', bg: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
    return { label: category, bg: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  };

  return (
    <section id="menu" className="py-20 sm:py-28 bg-gray-950 relative">
      <style>{`
        @keyframes cartBounceAnim { 0%,100%{transform:scale(1)} 20%{transform:scale(1.3)} 40%{transform:scale(0.9)} 60%{transform:scale(1.15)} 80%{transform:scale(0.95)} }
        @keyframes pulseRingSlate { 0%{box-shadow:0 0 0 0 rgba(148,163,184,0.5)} 70%{box-shadow:0 0 0 15px rgba(148,163,184,0)} 100%{box-shadow:0 0 0 0 rgba(148,163,184,0)} }
        @keyframes tooltipFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes tooltipFadeIn { 0%{opacity:0;transform:translateY(10px) scale(0.9)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes arrowBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
        @keyframes confirmSlide { 0%{opacity:0;transform:translateX(-50%) translateY(-20px)} 100%{opacity:1;transform:translateX(-50%) translateY(0)} }
        .cart-bounce { animation: cartBounceAnim 0.8s ease; }
        .cart-pulse { animation: pulseRingSlate 1.5s ease-out infinite; }
        .tooltip-float { animation: tooltipFloat 2s ease-in-out infinite; }
        .tooltip-enter { animation: tooltipFadeIn 0.4s ease-out forwards; }
        .arrow-bounce { animation: arrowBounce 0.8s ease-in-out infinite; }
        .confirm-slide { animation: confirmSlide 0.5s ease-out forwards; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-slate-400 text-sm uppercase tracking-[0.3em] font-medium">Nuestra Carta</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3">Menú</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-slate-500 to-slate-700 mx-auto mt-5 rounded-full" />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { key: 'todos', label: '🍽️ Todos' },
            { key: 'entrada', label: '🥗 Entrada' },
            { key: 'noche', label: '🔥 Asados' },
            { key: 'postres', label: '🍰 Postres' },
            { key: 'bebidas', label: '🍹 Bebidas' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-gradient-to-r from-slate-500 to-slate-700 text-white shadow-lg shadow-slate-700/30 border border-slate-500/50'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No hay productos disponibles en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item: any) => {
              const badge = getCategoryBadge(item.category);
              return (
                <div
                  key={item.id}
                  className="group bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-slate-500/30 hover:bg-white/[0.04] transition-all duration-500"
                >
                  {item.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    {!item.image && (
                      <span className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-white font-semibold text-lg group-hover:text-slate-300 transition-colors">{item.name}</h3>
                      <span className="text-slate-300 font-bold text-lg whitespace-nowrap">${item.price.toFixed(2)}</span>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.description}</p>
                    )}

                    {/* Botón agregar */}
                    <button
                      onClick={() => addToCart(item)}
                      className={`w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        addedId === item.id
                          ? 'bg-slate-600 text-white scale-95 border border-slate-400/30'
                          : 'bg-gradient-to-r from-slate-600 to-slate-800 text-white hover:from-slate-500 hover:to-slate-700 hover:shadow-lg hover:shadow-slate-700/25 active:scale-95 border border-slate-600/40'
                      }`}
                    >
                      {addedId === item.id ? '✓ ¡Agregado al pedido!' : '🛒 Agregar al pedido'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Carrito flotante */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {showTooltip && (
            <div className="tooltip-enter tooltip-float">
              <div className="bg-slate-100 text-gray-900 px-5 py-3 rounded-2xl shadow-2xl max-w-[220px] relative border border-slate-300">
                <p className="font-bold text-sm">👆 ¡Toca aquí para ver tu pedido!</p>
                <p className="text-xs text-gray-500 mt-1">Revisa y confirma tu orden</p>
                <div className="absolute -bottom-4 right-6 arrow-bounce">
                  <div className="text-2xl">👇</div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => { setCartOpen(true); setShowTooltip(false); }}
            className={`relative bg-gradient-to-r from-slate-500 to-slate-700 text-white w-16 h-16 rounded-full shadow-2xl shadow-slate-700/40 flex items-center justify-center text-2xl transition-transform border border-slate-400/30 ${cartBounce ? 'cart-bounce' : ''} cart-pulse`}
          >
            🛒
            <span className="absolute -top-2 -right-2 bg-white text-gray-900 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-400">
              {cartCount}
            </span>
          </button>
        </div>
      )}

      {/* Modal carrito */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => { setCartOpen(false); setShowForm(false); }}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div className="relative bg-gray-900 border border-slate-700/30 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-900 border-b border-slate-700/30 p-5 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-white">🛒 Tu Pedido</h3>
              <button onClick={() => { setCartOpen(false); setShowForm(false); }} className="text-gray-500 hover:text-white text-2xl">✕</button>
            </div>

            <div className="p-5 space-y-4">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center gap-3 bg-white/[0.03] border border-slate-700/20 rounded-xl p-3">
                  {c.image && <img src={c.image} alt={c.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{c.name}</p>
                    <p className="text-slate-300 text-sm font-semibold">${(c.price * c.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => updateQty(c.id, -1)} className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-lg">−</button>
                    <span className="text-white font-semibold w-6 text-center">{c.quantity}</span>
                    <button onClick={() => updateQty(c.id, 1)} className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-lg">+</button>
                  </div>
                  <button onClick={() => removeFromCart(c.id)} className="text-red-400 hover:text-red-300 p-1 flex-shrink-0">🗑️</button>
                </div>
              ))}

              <div className="flex items-center justify-between py-4 border-t border-slate-700/30">
                <span className="text-gray-400 text-lg">Total:</span>
                <span className="text-white text-2xl font-bold">${cartTotal.toFixed(2)}</span>
              </div>

              {!showForm ? (
                <button onClick={() => setShowForm(true)} className="w-full py-4 bg-gradient-to-r from-slate-500 to-slate-700 text-white rounded-xl font-semibold text-lg hover:from-slate-400 hover:to-slate-600 transition-all shadow-lg border border-slate-500/30">
                  Continuar con el pedido →
                </button>
              ) : (
                <div className="space-y-3 border-t border-slate-700/30 pt-4">
                  <h4 className="text-white font-semibold text-lg">📋 Datos para tu pedido</h4>

                  <div className="flex gap-3">
                    <button onClick={() => setOrderType('local')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${orderType === 'local' ? 'bg-slate-600/30 text-slate-200 border-2 border-slate-500/60' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                      🍽️ Comer aquí
                    </button>
                    <button onClick={() => setOrderType('llevar')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${orderType === 'llevar' ? 'bg-slate-600/30 text-slate-200 border-2 border-slate-500/60' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                      📦 Para llevar
                    </button>
                  </div>

                  <input placeholder="Tu nombre *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-white/[0.04] border border-slate-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-slate-500/50 text-sm" />

                  {orderType === 'llevar' && (
                    <input placeholder="Tu teléfono *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-white/[0.04] border border-slate-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-slate-500/50 text-sm" />
                  )}

                  <textarea placeholder="Notas adicionales (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full bg-white/[0.04] border border-slate-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-slate-500/50 text-sm resize-none" />

                  <button onClick={sendOrder} className="w-full py-4 bg-gradient-to-r from-slate-500 to-slate-700 text-white rounded-xl font-bold text-lg hover:from-slate-400 hover:to-slate-600 transition-all shadow-lg border border-slate-500/30 active:scale-95">
                    ✅ Enviar Pedido — ${cartTotal.toFixed(2)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmación */}
      {orderSent && (
        <div className="fixed top-6 left-1/2 z-50 confirm-slide">
          <div className="bg-slate-700 border border-slate-500/50 text-white px-8 py-5 rounded-2xl shadow-2xl shadow-slate-700/40 text-center whitespace-nowrap">
            <p className="font-bold text-lg">✅ ¡Pedido enviado!</p>
            <p className="text-sm text-slate-300 mt-1">{businessName} está preparando tu orden</p>
          </div>
        </div>
      )}
    </section>
  );
}
