import { useState, useRef } from 'react';
import { useStore } from '../store';
import type { MenuItem } from '../types';

type Tab = 'negocio' | 'menu' | 'pedidos' | 'reservas' | 'password';

export default function AdminPanel() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>('pedidos');

  const [bName, setBName] = useState(store.businessName);
  const [bSlogan, setBSlogan] = useState(store.slogan);
  const [bPhone, setBPhone] = useState(store.phone);
  const [bAddress, setBAddress] = useState(store.address);
  const [bLogo, setBLogo] = useState(store.logoUrl);
  const [aboutText, setAboutText] = useState(store.aboutText || '');
  const [aboutImage1, setAboutImage1] = useState(store.aboutImage1 || '');
  const [aboutImage2, setAboutImage2] = useState(store.aboutImage2 || '');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const about1Ref = useRef<HTMLInputElement>(null);
  const about2Ref = useRef<HTMLInputElement>(null);

  const [menuFilter, setMenuFilter] = useState<string>('todos');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: '', description: '', price: 0, category: 'noche', image: '', available: true });
  const menuImageRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  const [orderFilter, setOrderFilter] = useState<'todos' | 'pendiente' | 'preparando' | 'completado' | 'cancelado'>('todos');
  const [resFilter, setResFilter] = useState<'todas' | 'pendiente' | 'confirmada' | 'rechazada'>('todas');
  const [resSearch, setResSearch] = useState('');

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const compressImage = (file: File, maxW: number, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxW / img.width, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await compressImage(file, 300, 0.8);
    setBLogo(data);
  };

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, which: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await compressImage(file, 900, 0.75);
    if (which === 1) setAboutImage1(data);
    else setAboutImage2(data);
  };

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await compressImage(file, 600, 0.7);
    if (target === 'new') setNewItem({ ...newItem, image: data });
    else if (editingItem) setEditingItem({ ...editingItem, image: data });
  };

  const saveBusiness = () => {
    store.setBusinessInfo({ businessName: bName, slogan: bSlogan, phone: bPhone, address: bAddress, logoUrl: bLogo, aboutText, aboutImage1, aboutImage2 });
    alert('✅ Datos del negocio actualizados');
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return alert('Nombre y precio son requeridos');
    await store.addMenuItem({ ...newItem, available: true });
    setNewItem({ name: '', description: '', price: 0, category: 'noche', image: '', available: true });
    setShowAddForm(false);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    await store.updateMenuItem(editingItem);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este plato?')) return;
    await store.removeMenuItem(id);
  };

  const filteredMenu = store.menuItems.filter((i) => menuFilter === 'todos' || i.category === menuFilter);
  const filteredOrders = (store.orders as any[]).filter((o) => orderFilter === 'todos' || o.status === orderFilter);

  const orderCounts = {
    pendiente: (store.orders as any[]).filter((o) => o.status === 'pendiente').length,
    preparando: (store.orders as any[]).filter((o) => o.status === 'preparando').length,
    completado: (store.orders as any[]).filter((o) => o.status === 'completado').length,
    cancelado: (store.orders as any[]).filter((o) => o.status === 'cancelado').length,
  };

  const todayTotal = (store.orders as any[])
    .filter((o) => o.status !== 'cancelado' && o.createdAt && o.createdAt.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const filteredReservations = store.reservations.filter((r) => {
    const matchStatus = resFilter === 'todas' || r.status === resFilter;
    const matchSearch = !resSearch || r.name.toLowerCase().includes(resSearch.toLowerCase()) ||
      r.phone.includes(resSearch) || r.email.toLowerCase().includes(resSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const resCounts = {
    pendiente: store.reservations.filter((r) => r.status === 'pendiente').length,
    confirmada: store.reservations.filter((r) => r.status === 'confirmada').length,
    rechazada: store.reservations.filter((r) => r.status === 'rechazada').length,
  };

  const inputClass = 'w-full bg-white/[0.03] border border-slate-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-slate-500/50 transition-all text-sm';
  const btnPrimary = 'px-5 py-2.5 bg-gradient-to-r from-slate-500 to-slate-700 text-white rounded-xl hover:from-slate-400 hover:to-slate-600 transition-all text-sm font-medium border border-slate-500/30';
  const btnSecondary = 'px-5 py-2.5 bg-white/5 text-gray-500 rounded-xl hover:bg-white/10 hover:text-gray-300 transition-all text-sm border border-white/10';

  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: 'negocio', label: 'Negocio', icon: '🏪' },
    { key: 'menu', label: 'Menú', icon: '🍽️' },
    { key: 'pedidos', label: 'Pedidos', icon: '📦', badge: orderCounts.pendiente },
    { key: 'reservas', label: 'Reservas', icon: '📅', badge: resCounts.pendiente },
    { key: 'password', label: 'Clave', icon: '🔑' },
  ];

  return (
    <section id="admin" className="py-20 sm:py-28 bg-black/60 border-t border-slate-800/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-slate-400 text-sm uppercase tracking-[0.3em] font-medium">Administración</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Panel de Control</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-slate-500 to-slate-700 mx-auto mt-4 rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 relative ${
                tab === t.key
                  ? 'bg-gradient-to-r from-slate-500 to-slate-700 text-white shadow-lg border border-slate-500/30'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 border border-white/10'
              }`}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge && t.badge > 0 ? (
                <span className="absolute -top-2 -right-2 bg-slate-400 text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-slate-700/20 rounded-2xl p-5 sm:p-8">

          {/* NEGOCIO */}
          {tab === 'negocio' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Datos del Negocio</h3>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-2 block">Logo</label>
                <div className="flex items-center gap-4">
                  {bLogo ? (
                    <img src={bLogo} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 border-slate-600/30" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-slate-700/30 flex items-center justify-center text-gray-600 text-2xl">
                      {bName.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    <button onClick={() => logoInputRef.current?.click()} className={btnSecondary}>📷 Subir foto</button>
                    {bLogo && <button onClick={() => setBLogo('')} className="px-3 py-2 text-red-400 hover:text-red-300 text-sm">Quitar</button>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Nombre</label>
                  <input value={bName} onChange={(e) => setBName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Slogan</label>
                  <input value={bSlogan} onChange={(e) => setBSlogan(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Teléfono</label>
                  <input value={bPhone} onChange={(e) => setBPhone(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Dirección</label>
                  <input value={bAddress} onChange={(e) => setBAddress(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Mensaje corto (Sobre nosotros)</label>
                <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={3} className={inputClass + ' resize-none'} placeholder="Escribe un breve mensaje sobre tu negocio" />
              </div>

              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-2 block">Galería Sobre Nosotros (2 fotos)</label>
                <div className="flex items-center gap-4">
                  <div>
                    {aboutImage1 ? (
                      <img src={aboutImage1} alt="About 1" className="w-20 h-20 rounded-xl object-cover border border-slate-700/30" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-white/5 border border-slate-700/30 flex items-center justify-center text-gray-600">1</div>
                    )}
                    <input type="file" ref={about1Ref} onChange={(e) => handleAboutImageUpload(e, 1)} accept="image/*" className="hidden" />
                    <button onClick={() => about1Ref.current?.click()} className={btnSecondary + ' mt-2'}>📷 Subir 1</button>
                  </div>
                  <div>
                    {aboutImage2 ? (
                      <img src={aboutImage2} alt="About 2" className="w-20 h-20 rounded-xl object-cover border border-slate-700/30" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-white/5 border border-slate-700/30 flex items-center justify-center text-gray-600">2</div>
                    )}
                    <input type="file" ref={about2Ref} onChange={(e) => handleAboutImageUpload(e, 2)} accept="image/*" className="hidden" />
                    <button onClick={() => about2Ref.current?.click()} className={btnSecondary + ' mt-2'}>📷 Subir 2</button>
                  </div>
                </div>
              </div>

              <button onClick={saveBusiness} className={btnPrimary}>💾 Guardar Cambios</button>
            </div>
          )}

          {/* MENÚ */}
          {tab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-white">Gestión del Menú</h3>
                <button onClick={() => { setShowAddForm(!showAddForm); setEditingItem(null); }} className={btnPrimary}>
                  {showAddForm ? '✕ Cerrar' : '+ Agregar Plato'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'todos', label: 'Todos' },
                  { key: 'entrada', label: '🥗 Entrada' },
                  { key: 'noche', label: '🔥 Noche' },
                  { key: 'postres', label: '🍰 Postres' },
                  { key: 'bebidas', label: '🍹 Bebidas' },
                ].map((f) => (
                  <button key={f.key} onClick={() => setMenuFilter(f.key)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      menuFilter === f.key ? 'bg-slate-600/20 text-slate-300 border border-slate-500/30' : 'bg-white/5 text-gray-600 border border-white/10 hover:text-gray-400'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {showAddForm && (
                <div className="bg-white/[0.02] border border-slate-600/20 rounded-xl p-5 space-y-4">
                  <h4 className="text-white font-semibold">Nuevo Plato</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="Nombre *" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className={inputClass} />
                    <input placeholder="Precio *" type="number" step="0.01" value={newItem.price || ''} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} className={inputClass} />
                  </div>
                  <textarea placeholder="Descripción" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className={inputClass + ' resize-none'} rows={2} />
                  <div className="flex flex-wrap gap-3 items-center">
                    <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })} className={inputClass + ' !w-auto'}>
                      <option value="entrada" className="bg-gray-900">🥗 Entrada</option>
                      <option value="noche" className="bg-gray-900">🔥 Noche</option>
                      <option value="postres" className="bg-gray-900">🍰 Postres</option>
                      <option value="bebidas" className="bg-gray-900">🍹 Bebidas</option>
                    </select>
                    <input type="file" ref={menuImageRef} onChange={(e) => handleMenuImageUpload(e, 'new')} accept="image/*" className="hidden" />
                    <button onClick={() => menuImageRef.current?.click()} className={btnSecondary}>📷 Subir foto</button>
                    {newItem.image && <img src={newItem.image} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-700/30" />}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAddItem} className={btnPrimary}>✅ Agregar</button>
                    <button onClick={() => setShowAddForm(false)} className={btnSecondary}>Cancelar</button>
                  </div>
                </div>
              )}

              {editingItem && (
                <div className="bg-white/[0.02] border border-slate-500/20 rounded-xl p-5 space-y-4">
                  <h4 className="text-white font-semibold">Editando: {editingItem.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className={inputClass} />
                    <input type="number" step="0.01" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })} className={inputClass} />
                  </div>
                  <textarea value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass + ' resize-none'} rows={2} />
                  <div className="flex flex-wrap gap-3 items-center">
                    <select value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })} className={inputClass + ' !w-auto'}>
                      <option value="entrada" className="bg-gray-900">🥗 Entrada</option>
                      <option value="noche" className="bg-gray-900">🔥 Noche</option>
                      <option value="postres" className="bg-gray-900">🍰 Postres</option>
                      <option value="bebidas" className="bg-gray-900">🍹 Bebidas</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingItem.available} onChange={(e) => setEditingItem({ ...editingItem, available: e.target.checked })} className="accent-slate-400" />
                      <span className="text-gray-500 text-sm">Disponible</span>
                    </label>
                    <input type="file" ref={editImageRef} onChange={(e) => handleMenuImageUpload(e, 'edit')} accept="image/*" className="hidden" />
                    <button onClick={() => editImageRef.current?.click()} className={btnSecondary}>📷 Cambiar foto</button>
                    {editingItem.image && (
                      <>
                        <img src={editingItem.image} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-700/30" />
                        <button onClick={() => setEditingItem({ ...editingItem, image: '' })} className="text-red-400 text-xs hover:text-red-300">Quitar</button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleUpdateItem} className={btnPrimary}>💾 Guardar</button>
                    <button onClick={() => setEditingItem(null)} className={btnSecondary}>Cancelar</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filteredMenu.length === 0 && <p className="text-gray-700 text-center py-8">No hay platos en esta categoría.</p>}
                {filteredMenu.map((item) => (
                  <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${item.available ? 'bg-white/[0.02] border-slate-700/20' : 'bg-red-500/5 border-red-500/10 opacity-60'}`}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                        {item.category === 'bebidas' ? '🍹' : item.category === 'entrada' ? '🥗' : item.category === 'postres' ? '🍰' : '🔥'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{item.name}</span>
                        {!item.available && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Oculto</span>}
                      </div>
                      <span className="text-slate-400 text-sm font-semibold">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditingItem(item); setShowAddForm(false); }} className="p-2 text-gray-600 hover:text-slate-300 transition-colors">✏️</button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PEDIDOS */}
          {tab === 'pedidos' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">📦 Gestión de Pedidos</h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-700/10 border border-slate-600/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-slate-300">{orderCounts.pendiente}</div>
                  <div className="text-slate-500 text-xs mt-1">Pendientes</div>
                </div>
                <div className="bg-slate-600/10 border border-slate-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-slate-400">{orderCounts.preparando}</div>
                  <div className="text-slate-500 text-xs mt-1">Preparando</div>
                </div>
                <div className="bg-slate-500/10 border border-slate-400/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-slate-300">{orderCounts.completado}</div>
                  <div className="text-slate-500 text-xs mt-1">Completados</div>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{orderCounts.cancelado}</div>
                  <div className="text-red-500/60 text-xs mt-1">Cancelados</div>
                </div>
                <div className="bg-slate-600/10 border border-slate-500/20 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                  <div className="text-2xl font-bold text-white">${todayTotal.toFixed(2)}</div>
                  <div className="text-slate-500 text-xs mt-1">Ventas hoy</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'todos' as const, label: 'Todos' },
                  { key: 'pendiente' as const, label: '⏳ Pendientes' },
                  { key: 'preparando' as const, label: '👨‍🍳 Preparando' },
                  { key: 'completado' as const, label: '✅ Completados' },
                  { key: 'cancelado' as const, label: '❌ Cancelados' },
                ]).map((f) => (
                  <button key={f.key} onClick={() => setOrderFilter(f.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      orderFilter === f.key ? 'bg-slate-600/20 text-slate-300 border border-slate-500/30' : 'bg-white/5 text-gray-600 border border-white/10 hover:text-gray-400'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredOrders.length === 0 && <p className="text-gray-700 text-center py-8">No hay pedidos.</p>}
                {filteredOrders.map((order: any) => (
                  <div key={order.id} className="bg-white/[0.02] border border-slate-700/20 rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-white font-semibold text-lg">{order.customerName}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600 text-xs mt-1">
                          {order.customerPhone && <span>📞 {order.customerPhone}</span>}
                          <span>{order.orderType === 'llevar' ? '📦 Para llevar' : '🍽️ Comer aquí'}</span>
                          <span>🕐 {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</span>
                        </div>
                        {order.notes && <p className="text-gray-700 text-xs mt-2 italic">"{order.notes}"</p>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        order.status === 'pendiente' ? 'bg-slate-600/20 text-slate-300 border border-slate-500/30' :
                        order.status === 'preparando' ? 'bg-slate-500/20 text-slate-200 border border-slate-400/30' :
                        order.status === 'completado' ? 'bg-slate-400/20 text-slate-200 border border-slate-300/30' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="bg-white/[0.02] rounded-lg p-3 space-y-2">
                      {order.items && order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded object-cover opacity-80" />}
                            <span className="text-gray-400">{item.quantity}x {item.name}</span>
                          </div>
                          <span className="text-slate-300 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/20">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-white font-bold text-lg">${(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/30">
                      {order.status === 'pendiente' && (
                        <button onClick={() => store.updateOrderStatus(order.id, 'preparando')}
                          className="px-3 py-1.5 text-xs bg-slate-600/20 text-slate-300 rounded-lg hover:bg-slate-600/30 transition-all border border-slate-600/20">
                          👨‍🍳 Preparar
                        </button>
                      )}
                      {order.status === 'preparando' && (
                        <button onClick={() => store.updateOrderStatus(order.id, 'completado')}
                          className="px-3 py-1.5 text-xs bg-slate-500/20 text-slate-200 rounded-lg hover:bg-slate-500/30 transition-all border border-slate-500/20">
                          ✅ Completar
                        </button>
                      )}
                      {(order.status === 'pendiente' || order.status === 'preparando') && (
                        <button onClick={() => store.updateOrderStatus(order.id, 'cancelado')}
                          className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">
                          ❌ Cancelar
                        </button>
                      )}
                      <button onClick={() => { if (confirm('¿Eliminar este pedido?')) store.removeOrder(order.id); }}
                        className="px-3 py-1.5 text-xs bg-white/5 text-gray-600 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all ml-auto">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(store.orders as any[]).length > 0 && (
                <button onClick={() => { if (confirm('⚠️ ¿Eliminar TODOS los pedidos?')) store.clearAllOrders(); }}
                  className="w-full py-3 bg-red-500/5 text-red-400 rounded-xl hover:bg-red-500/10 transition-all text-sm border border-red-500/10">
                  🗑️ Eliminar Todos los Pedidos
                </button>
              )}
            </div>
          )}

          {/* RESERVAS */}
          {tab === 'reservas' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Gestión de Reservas</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-700/10 border border-slate-600/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-slate-300">{resCounts.pendiente}</div>
                  <div className="text-slate-600 text-xs mt-1">Pendientes</div>
                </div>
                <div className="bg-slate-500/10 border border-slate-400/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-slate-200">{resCounts.confirmada}</div>
                  <div className="text-slate-500 text-xs mt-1">Confirmadas</div>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{resCounts.rechazada}</div>
                  <div className="text-red-500/60 text-xs mt-1">Rechazadas</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <input placeholder="🔍 Buscar..." value={resSearch} onChange={(e) => setResSearch(e.target.value)} className={inputClass + ' sm:!w-64'} />
                <div className="flex gap-2">
                  {(['todas', 'pendiente', 'confirmada', 'rechazada'] as const).map((f) => (
                    <button key={f} onClick={() => setResFilter(f)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        resFilter === f ? 'bg-slate-600/20 text-slate-300 border border-slate-500/30' : 'bg-white/5 text-gray-600 border border-white/10 hover:text-gray-400'
                      }`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredReservations.length === 0 && <p className="text-gray-700 text-center py-8">No hay reservas.</p>}
                {filteredReservations.map((r) => (
                  <div key={r.id} className="bg-white/[0.02] border border-slate-700/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-white font-semibold">{r.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600 text-xs mt-1">
                          <span>📞 {r.phone}</span>
                          {r.email && <span>✉️ {r.email}</span>}
                          <span>📅 {r.date}</span>
                          <span>🕐 {r.time}</span>
                          <span>👥 {r.guests}</span>
                        </div>
                        {r.notes && <p className="text-gray-700 text-xs mt-2 italic">"{r.notes}"</p>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        r.status === 'pendiente' ? 'bg-slate-600/20 text-slate-300 border border-slate-500/30' :
                        r.status === 'confirmada' ? 'bg-slate-400/20 text-slate-200 border border-slate-300/30' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>{r.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/20">
                      {r.status !== 'confirmada' && (
                        <button onClick={() => store.updateReservationStatus(r.id, 'confirmada')} className="px-3 py-1.5 text-xs bg-slate-500/20 text-slate-300 rounded-lg hover:bg-slate-500/30 transition-all border border-slate-500/20">✅ Confirmar</button>
                      )}
                      {r.status !== 'rechazada' && (
                        <button onClick={() => store.updateReservationStatus(r.id, 'rechazada')} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">❌ Rechazar</button>
                      )}
                      {r.status !== 'pendiente' && (
                        <button onClick={() => store.updateReservationStatus(r.id, 'pendiente')} className="px-3 py-1.5 text-xs bg-slate-700/20 text-slate-400 rounded-lg hover:bg-slate-700/30 transition-all">⏳ Pendiente</button>
                      )}
                      <button onClick={() => { if (confirm('¿Eliminar?')) store.removeReservation(r.id); }}
                        className="px-3 py-1.5 text-xs bg-white/5 text-gray-600 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all ml-auto">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>

              {store.reservations.length > 0 && (
                <button onClick={() => { if (confirm('⚠️ ¿Eliminar TODAS?')) store.clearAllReservations(); }}
                  className="w-full py-3 bg-red-500/5 text-red-400 rounded-xl hover:bg-red-500/10 transition-all text-sm border border-red-500/10">
                  🗑️ Eliminar Todas
                </button>
              )}
            </div>
          )}

          {/* PASSWORD */}
          {tab === 'password' && (
            <div className="space-y-6 max-w-md">
              <h3 className="text-xl font-bold text-white">Cambiar Contraseña</h3>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Actual</label>
                <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Nueva</label>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Confirmar</label>
                <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className={inputClass} />
              </div>
              {passMsg && <p className={`text-sm ${passMsg.includes('✅') ? 'text-slate-300' : 'text-red-400'}`}>{passMsg}</p>}
              <button onClick={() => {
                if (oldPass !== store.adminPassword) { setPassMsg('❌ Contraseña actual incorrecta'); return; }
                if (newPass.length < 4) { setPassMsg('❌ Mínimo 4 caracteres'); return; }
                if (newPass !== confirmPass) { setPassMsg('❌ No coinciden'); return; }
                store.changePassword(newPass);
                setOldPass(''); setNewPass(''); setConfirmPass('');
                setPassMsg('✅ Contraseña actualizada');
                setTimeout(() => setPassMsg(''), 3000);
              }} className={btnPrimary}>🔑 Cambiar</button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
