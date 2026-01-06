import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Coffee } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fake cart count for demonstration
  const cartCount = 3; 

  // Detect scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-100 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* LOGO SECTION */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-orange-600 rounded-full text-white group-hover:bg-orange-700 transition-colors">
              <Coffee size={20} />
            </div>
            <span className="text-xl font-bold text-stone-800 tracking-tight">
              Brew<span className="text-orange-600">Haven</span>.
            </span>
          </Link>

          {/* DESKTOP LINKS (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/about">Our Story</NavLink>
            <NavLink to="/blog">Blog</NavLink>
          </div>

          {/* ICONS / ACTIONS */}
          <div className="flex items-center gap-4">
            
            {/* Search or other icons could go here */}

            {/* Cart Icon with Badge */}
            <Link to="/cart" className="relative p-2 text-stone-600 hover:text-orange-600 transition-colors">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login Button (Desktop) */}
            <Link 
              to="/login" 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-all shadow-lg shadow-stone-900/20"
            >
              <User size={16} />
              <span>Login</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-stone-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {/* Only shows when state is true */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-stone-100 shadow-xl flex flex-col items-center gap-4 py-6 transition-all duration-300 origin-top ${isMobileMenuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 h-0 overflow-hidden"}`}>
            <MobileLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</MobileLink>
            <MobileLink to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</MobileLink>
            <MobileLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>Our Story</MobileLink>
            <Link 
              to="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full text-sm font-medium"
            >
              <User size={16} />
              <span>Login / Register</span>
            </Link>
        </div>
      </nav>
      
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-24"></div> 
    </>
  );
}

// Helper Components for clean code
function NavLink({ to, children }) {
  return (
    <Link 
      to={to} 
      className="text-stone-600 font-medium text-sm hover:text-orange-600 transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
    </Link>
  );
}

function MobileLink({ to, children, onClick }) {
    return (
      <Link 
        to={to} 
        onClick={onClick}
        className="text-stone-800 font-medium text-lg hover:text-orange-600"
      >
        {children}
      </Link>
    );
  }