import React, { useState, useEffect } from "react";
import {
  Zap,
  MapPin,
  Search,
  ShoppingCart,
  RotateCcw,
  ChevronDown,
  PhoneCall,
  User
} from "lucide-react";
import { JAMSHEDPUR_AREAS } from "../data/paintDatabase";
import { CartItem, AppNotification } from "../types";
import { useAuth } from "../context/AuthContext";
import { getDeliveryTime } from "../utils/delivery";
import AuthModal from "./AuthModal";
import ProfileSettingsModal from "./ProfileSettingsModal";

interface HeaderProps {
  currentArea: string;
  onAreaChange: (area: string) => void;
  onRequestLocationChange?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: any) => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenConsultantChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentArea,
  onAreaChange,
  onRequestLocationChange,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  cartItems,
  onOpenCart,
  notifications,
  onOpenNotifications,
  onOpenConsultantChat,
}) => {
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, profile, signOut } = useAuth();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce(
    (acc, item) => acc + item.pack.price * item.quantity + item.tintingCharge * item.quantity,
    0
  );
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${isScrolled ? 'shadow-md' : 'border-b border-slate-100'}`}>
        <div className="px-3 sm:px-6 py-3">
          {/* Top Row: Location & Actions */}
          <div className="flex items-center justify-between gap-4 mb-3">
            
            {/* Location Picker */}
            <div className="flex-1 min-w-0 md:flex-none">
              <div 
                className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-colors" 
                onClick={onRequestLocationChange}
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <span>Delivery in {getDeliveryTime(currentArea)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] sm:text-sm text-slate-600 hover:text-slate-900 transition-colors text-left w-full">
                    <span className="truncate max-w-[150px] sm:max-w-[250px] font-medium">
                      {currentArea}, Jamshedpur
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Global Search (Desktop only inline, Mobile below) */}
            <div className="hidden md:block flex-1 max-w-2xl px-8">
              <div className="relative group w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search 'Primer', 'Asian Paints', or 'BO-7821'..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-200 rounded-full text-xs text-slate-600 hover:bg-slate-300 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a href="tel:+917004734407" className="p-2.5 rounded-full bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors hidden sm:block">
                <PhoneCall className="w-5 h-5" />
              </a>

              <button onClick={onOpenCart} className="relative p-2.5 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <ShoppingCart className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative z-50">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-1.5 p-1 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border border-slate-200">
                    <span className="bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                      {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </span>
                  </button>
                  
                  {isUserMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />}
                  
                  {/* Account Dropdown */}
                  <div className={`absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl transition-all duration-200 origin-top-right z-50 ${isUserMenuOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95 pointer-events-none'}`}>
                    <div className="p-4 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-sm">My Account</div>
                      <div className="text-xs truncate text-slate-500 mt-0.5">{user.email}</div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setIsProfileModalOpen(true); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 cursor-pointer">
                        <User className="w-4 h-4 text-slate-400" /> Edit Profile
                      </button>
                      <button onClick={() => { onTabChange("history"); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 cursor-pointer mt-1">
                        <RotateCcw className="w-4 h-4 text-slate-400" /> Past Orders
                      </button>
                    </div>
                    <div className="p-2 border-t border-slate-100">
                      <button onClick={() => { signOut(); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-3 cursor-pointer">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center justify-center w-11 h-11 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200">
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden relative group w-full mb-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 'Primer', 'Asian Paints'..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full text-xs text-slate-600 hover:bg-slate-300 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      <ProfileSettingsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};