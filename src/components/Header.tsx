import React, { useState } from "react";
import {
  Zap,
  MapPin,
  Search,
  ShoppingBag,
  Bell,
  Sparkles,
  RotateCcw,
  Award,
  ChevronDown,
  PhoneCall,
  ShieldCheck,
  User,
  Settings, // Added for Admin icon
  Truck,    // Added for Delivery icon
} from "lucide-react";
import { JAMSHEDPUR_AREAS } from "../data/paintDatabase";
import { CartItem, LoyaltyProfile, AppNotification } from "../types";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import ProfileSettingsModal from "./ProfileSettingsModal";

interface HeaderProps {
  currentArea: string;
  onAreaChange: (area: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Added "admin" and "delivery" to the valid tab types
  activeTab: "store" | "projects" | "history" | "loyalty" | "chat" | "services" | "admin" | "delivery";
  onTabChange: (
    tab: "store" | "projects" | "history" | "loyalty" | "chat" | "services" | "admin" | "delivery"
  ) => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  loyalty: LoyaltyProfile;
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
  loyalty,
  notifications,
  onOpenNotifications,
  onOpenConsultantChat,
}) => {
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Pull user, profile data, and signout function from context
  const { user, profile, signOut } = useAuth();

  // Role Checks
  const isAdmin = user?.email === "singhrajputn197@gmail.com";
  const isDelivery = profile?.role === "delivery";

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce(
    (acc, item) => acc + item.pack.price * item.quantity + item.tintingCharge * item.quantity,
    0
  );
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        
        {/* --- DYNAMIC ROLE BANNER --- */}
        {(isAdmin || isDelivery) && (
          <div className="bg-emerald-700 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-sm z-50">
            <div className="text-emerald-100 text-[10px] font-bold tracking-widest uppercase">
              {isAdmin ? "Admin Mode Active" : "Delivery Mode Active"}
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => onTabChange(activeTab === "admin" ? "store" : "admin")}
                  className="bg-white text-emerald-900 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {activeTab === "admin" ? "Return to Store" : "Open Admin Panel"}
                </button>
              )}
              {isDelivery && (
                <button
                  onClick={() => onTabChange(activeTab === "delivery" ? "store" : "delivery")}
                  className="bg-cyan-400 text-cyan-950 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-cyan-300 transition-colors cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  {activeTab === "delivery" ? "Return to Store" : "Open Delivery Portal"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top micro banner */}
        <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                ⚡ 30-40 Min Jamshedpur Delivery
              </span>
              <span className="hidden sm:inline text-slate-300">
                Nikhil Paints & Hardware • Near Moon City, Dimna Mango Road
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <button
                onClick={onOpenConsultantChat}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Free Shade & Paint Consultation</span>
              </button>
              <a
                href="tel:+917004734407"
                className="hidden md:flex items-center gap-1 hover:text-amber-400 transition-colors text-[11px]"
              >
                <PhoneCall className="w-3 h-3" />
                <span>+91 70047 34407</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            {/* Logo & Location */}
            <div className="flex items-center gap-3 lg:gap-5 min-w-fit">
              <button
                onClick={() => onTabChange("store")}
                className="text-left group cursor-pointer focus:outline-hidden"
                id="app-logo-button"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                    NP
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-tight">
                        NIKHIL PAINTS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      & Hardware • Jamshedpur
                    </p>
                  </div>
                </div>
              </button>

              {/* Delivery Location Picker */}
              <div className="relative hidden md:block border-l border-slate-200 pl-4">
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Delivery in 35 MINS to:
                </div>
                <button
                  onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-amber-700 transition-colors cursor-pointer"
                  id="location-picker-btn"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate max-w-[130px]">
                    {currentArea}, Jamshedpur
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showAreaDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[11px] font-bold text-slate-700 px-2 py-1 border-b border-slate-100 mb-1">
                      Select Your Jamshedpur Locality
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      {JAMSHEDPUR_AREAS.map((area) => (
                        <button
                          key={area}
                          onClick={() => {
                            onAreaChange(area);
                            setShowAreaDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                            currentArea === area
                              ? "bg-amber-50 text-amber-900 font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{area}</span>
                          {currentArea === area && (
                            <span className="text-[10px] text-amber-600 font-bold">
                              Selected
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search 7,000+ shade codes (e.g. 0427, L152, BO-7821, Asian Paints, Putty)..."
                  className="w-full bg-slate-100/90 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  id="global-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Right Action Icons & Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* AUTHENTICATION / USER ACCOUNT */}
              {user ? (
                <div className="relative group z-50">
                  <button className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200">
                    <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                      {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </span>
                    <span className="hidden md:inline text-xs font-bold text-slate-700">
                      Account
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden md:inline" />
                  </button>

                  {/* Account Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
                    <div className="p-3 border-b border-slate-100 text-xs truncate text-slate-500">
                      {user.email}
                    </div>
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => onTabChange("history")}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                      Past Orders
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-b-xl flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-bold hover:bg-blue-100 transition-colors text-xs sm:text-sm cursor-pointer"
                >
                  <User className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}

              {/* Loyalty Coins Badge */}
              <button
                onClick={() => onTabChange("loyalty")}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer text-xs font-bold"
                id="header-loyalty-btn"
                title="Nikhil Rang Club Rewards"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>{loyalty.rangCoins} Coins</span>
                <span className="text-[10px] bg-amber-200/80 px-1 py-0.2 rounded-sm text-amber-950">
                  ₹{(loyalty.rangCoins * 0.5).toFixed(0)}
                </span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
                id="header-notif-btn"
                title="Push Notifications & Deals"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 rounded-xl font-bold shadow-sm transition-all cursor-pointer hover:shadow-md"
                id="header-cart-btn"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[10px] uppercase font-bold text-emerald-100">
                    {totalCartCount > 0 ? `${totalCartCount} items` : "My Cart"}
                  </div>
                  <div className="text-xs font-black">
                    {totalCartCount > 0 ? `₹${totalCartPrice.toFixed(2)}` : "Empty"}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Secondary Navigation Tabs */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => onTabChange("store")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "store" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Store & 7000+ Shades</span>
            </button>

            <button
              onClick={() => onTabChange("services")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "services" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Professional Services</span>
            </button>

            <button
              onClick={() => onTabChange("history")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "history" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Past Orders & Reorder</span>
            </button>

            <button
              onClick={() => onTabChange("loyalty")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "loyalty" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Nikhil Rang Club Rewards</span>
            </button>

            <button
              onClick={() => onTabChange("chat")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "chat" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Paint & Color Expert Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Render the Auth Modal when state is true */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

      {/* Render the Profile Settings Modal */}
      <ProfileSettingsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};