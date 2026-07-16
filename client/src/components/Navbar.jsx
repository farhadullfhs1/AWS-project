import { useEffect, useState } from 'react';
import { Coffee, ShoppingBag, LogOut, Menu as MenuIcon, X, Bell, ReceiptText } from 'lucide-react';
// Assuming you have a UI button component imported here based on your original code
import { Button } from './ui'; 

export default function Navbar({ view, setView, cartCount, user, onLogout, activeOrder }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user?.is_staff) setIsMobileMenuOpen(false);
  }, [user?.is_staff]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        
        {/* LOGO (Always Visible) */}
        <div onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer group select-none">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl rotate-3 flex items-center justify-center text-white shadow-lg shadow-amber-600/20 group-hover:rotate-6 group-hover:shadow-amber-600/40 transition-all duration-300 ease-out">
            <Coffee size={22} strokeWidth={2.5} className="-rotate-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white tracking-tight leading-none font-sans">
              BREW<span className="text-amber-500">HAVEN</span>
            </span>
            <span className="text-[10px] font-medium text-neutral-400 tracking-[0.2em] uppercase leading-none mt-1 group-hover:text-amber-500/80 transition-colors">
              Coffee Co.
            </span>
          </div>
        </div>

        {/* --- STAFF DASHBOARD VIEW --- */}
        {user?.is_staff && view === 'staff' && (
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-white">Staff Dashboard</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{user.staff_branch || 'Unassigned branch'}</span>
            </div>
            
            <div className="h-8 w-px bg-neutral-800"></div> {/* Subtle visual divider */}
            
            <span className="text-sm text-neutral-400">Hi, {user.username || 'Staff'}</span>
            
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-red-500/40 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        {/* --- CUSTOMER VIEW (Hidden when on Staff Dashboard) --- */}
        {view !== 'staff' && (
          <>
            {/* Center Links */}
            <div className="hidden md:flex items-center gap-8">
              {['Home', 'Menu'].map((item) => (
                <button key={item} onClick={() => setView(item.toLowerCase())} className={`text-sm font-medium transition-colors hover:text-amber-500 ${view === item.toLowerCase() ? 'text-amber-500' : 'text-neutral-300'}`}>{item}</button>
              ))}
              {user && activeOrder && (
                <button onClick={() => setView('track')} className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${view === 'track' ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-500'}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Track Order
                </button>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-neutral-400">Hi, {user.username || 'User'}{user.staff_branch ? ` · ${user.staff_branch}` : ''}</span>
                  
                  {user.is_staff && (
                    <button onClick={() => setView('staff')} className="text-sm font-medium text-neutral-300 hover:text-amber-500 transition-colors flex items-center gap-1.5">
                      Staff Queue
                    </button>
                  )}
                  
                  <button onClick={() => setView('orders')} className="inline-flex items-center gap-2 text-neutral-300 hover:text-amber-500" title="My Orders">
                    <ReceiptText size={20} />
                    <span className="text-sm font-medium">My Orders</span>
                  </button>
                  
                  <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-red-500/40 hover:text-red-400 transition-colors" title="Logout">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('login')} className="text-neutral-300 hover:text-white font-medium text-sm">Log In</button>
                </div>
              )}
              
              <button onClick={() => setView('cart')} className="relative p-2 text-neutral-300 hover:text-amber-500 transition-colors">
                <ShoppingBag size={22} />
                {cartCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-neutral-950">{cartCount}</span>}
              </button>
            </div>
          </>
        )}

        {/* Mobile Menu Toggle */}
        <button className={`md:hidden text-white ${user?.is_staff && view === 'staff' ? 'hidden' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {!user?.is_staff && isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 absolute w-full px-4 py-4 flex flex-col gap-4">
          <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Home</button>
          <button onClick={() => { setView('menu'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Menu</button>
          {user && activeOrder && <button onClick={() => { setView('track'); setIsMobileMenuOpen(false); }} className="text-left text-amber-500 py-2 flex items-center gap-2"><Bell size={16}/> Track Order</button>}
          <button onClick={() => { setView('cart'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Cart ({cartCount})</button>
          {!user ? (
            <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="text-left text-amber-500 py-2">Login</button>
          ) : (
            <div className="flex gap-2">
              {user.is_staff && (
                <button onClick={() => { setView('staff'); setIsMobileMenuOpen(false); }} className="flex-1 text-left text-amber-500 py-2">Staff Queue</button>
              )}
              <button onClick={() => { setView('orders'); setIsMobileMenuOpen(false); }} className="flex-1 text-left text-amber-500 py-2">My Orders</button>
              <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-neutral-200">
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}