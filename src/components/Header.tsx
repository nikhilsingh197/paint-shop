import React, { useState, useEffect } from "react";
import {
  Zap,
  MapPin,
  Search,
  Bell,
  RotateCcw,
  ChevronDown,
  PhoneCall,
  User
} from "lucide-react";
import { JAMSHEDPUR_AREAS } from "../data/paintDatabase";
import { CartItem, AppNotification } from "../types";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import ProfileSettingsModal from "./ProfileSettingsModal";

interface HeaderProps {
  currentArea: string;
  onAreaChange: (area: string) => void;
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
              <div className="text-[10px] sm:text-xs font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                </div>
                <span>Delivery in 35 mins</span>
              </div>
              <div className="relative mt-0.5">
                <button
                  onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                  className="flex items-center gap-1 text-[13px] sm:text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer text-left w-full"
                >
                  <span className="truncate max-w-[150px] sm:max-w-[250px] font-medium">
                    {currentArea}, Jamshedpur
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {showAreaDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase px-3 py-2 border-b border-slate-100 mb-1">
                      Select Jamshedpur Locality
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {JAMSHEDPUR_AREAS.map((area) => (
                        <button
                          key={area}
                          onClick={() => {
                            onAreaChange(area);
                            setShowAreaDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center justify-between transition-colors ${
                            currentArea === area
                              ? "bg-amber-50 text-amber-900 font-bold"
                              : "text-slate-700 hover:bg-slate-50 font-medium"
                          }`}
                        >
                          <span>{area}</span>
                          {currentArea === area && (
                            <MapPin className="w-4 h-4 text-amber-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

              <button onClick={onOpenNotifications} className="relative p-2.5 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative group z-50">
                  <button className="flex items-center gap-1.5 p-1 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border border-slate-200">
                    <span className="bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                      {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </span>
                  </button>
                  {/* Account Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-sm">My Account</div>
                      <div className="text-xs truncate text-slate-500 mt-0.5">{user.email}</div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => setIsProfileModalOpen(true)} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 cursor-pointer">
                        <User className="w-4 h-4 text-slate-400" /> Edit Profile
                      </button>
                      <button onClick={() => onTabChange("history")} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 cursor-pointer mt-1">
                        <RotateCcw className="w-4 h-4 text-slate-400" /> Past Orders
                      </button>
                    </div>
                    <div className="p-2 border-t border-slate-100">
                      <button onClick={() => signOut()} className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-3 cursor-pointer">
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