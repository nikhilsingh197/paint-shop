import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, User, Package, Wallet, MessageCircle, MapPin, Heart, FileText, Gift, Pill, CreditCard, Share2, Info, Lock, Bell, LogOut, Coins } from "lucide-react";
import AboutUsModal from "./AboutUsModal";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange?: (tab: string) => void;
  onRequestLocationChange?: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose, onTabChange, onRequestLocationChange }: ProfileSettingsModalProps) {
  const { user, profile, signOut } = useAuth();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#f8f9fa] overflow-y-auto animate-in slide-in-from-right-full duration-300 pb-10">
      
      {/* Header Section */}
      <div className="relative bg-gradient-to-b from-[#fcd34d] via-[#fcd34d]/60 to-[#f8f9fa] pt-4 pb-6 px-4">
        <button onClick={onClose} className="absolute top-4 left-4 p-2.5 bg-white rounded-full shadow-sm active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        
        <div className="flex flex-col items-center mt-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/10 mb-4 overflow-hidden border-4 border-white">
            <User className="w-12 h-12 text-slate-800" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
          <div className="text-[11px] font-bold text-slate-600 mt-1.5 flex items-center gap-1.5 opacity-80">
            {profile?.phone || 'Add phone number'}
          </div>
        </div>

        {/* Top Quick Links */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button onClick={() => { if(onTabChange) onTabChange("history"); onClose(); }} className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform">
            <div className="bg-amber-50 p-2.5 rounded-full text-amber-600"><Package className="w-5 h-5" /></div>
            <span className="text-[10px] font-extrabold text-slate-800 text-center">Your orders</span>
          </button>
          
          <button onClick={() => window.open('https://wa.me/917004734407?text=Hi%2C%20I%20need%20help%20with%20my%20Paint%20Shop%20order.', '_blank')} className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform">
            <div className="bg-emerald-50 p-2.5 rounded-full text-emerald-600"><MessageCircle className="w-5 h-5" /></div>
            <span className="text-[10px] font-extrabold text-slate-800 text-center">Need help?</span>
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-2 relative z-10">
        
        {/* Your Information */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-xs font-black text-slate-800 px-4 py-4 bg-white border-b border-slate-50">Your information</h3>
          
          <button onClick={() => { if(onRequestLocationChange) onRequestLocationChange(); onClose(); }} className="w-full flex items-center justify-between px-4 py-4 active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
              <span className="text-sm font-bold text-slate-700">Address book</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
          </button>
        </div>

        {/* Other Information */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-xs font-black text-slate-800 px-4 py-4 bg-white border-b border-slate-50">Other Information</h3>
          
          <button className="w-full flex items-center justify-between px-4 py-4 border-b border-slate-50 active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
              <span className="text-sm font-bold text-slate-700">Share the app</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
          </button>
          
          <button onClick={() => setIsAboutOpen(true)} className="w-full flex items-center justify-between px-4 py-4 border-b border-slate-50 active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
              <span className="text-sm font-bold text-slate-700">About us</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
          </button>
          
          <button onClick={handleSignOut} className="w-full flex items-center justify-between px-4 py-4 active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-rose-500" strokeWidth={1.5} />
              <span className="text-sm font-bold text-rose-600">Log out</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-rose-300 rotate-180" />
          </button>
        </div>
        
        <div className="text-center py-6">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paint Shop</div>
          <div className="text-[9px] font-bold text-slate-300 mt-1">v1.0.0</div>
        </div>
        
      </div>

      <AboutUsModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}