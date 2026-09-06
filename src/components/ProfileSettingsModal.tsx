import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { JAMSHEDPUR_AREAS } from "../data/paintDatabase";
import { X, MapPin, User, Phone, CheckCircle2, Home, Crosshair, Navigation } from "lucide-react";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Geolocation States
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    street_address: "",
    area: "Mango",
    landmark: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Auto-fill form
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        street_address: profile.street_address || "",
        area: profile.area || "Mango",
        landmark: profile.landmark || "",
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
      });
      setSuccess(false);
      setLocationSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // --- HTML5 Geolocation Pinpoint Logic ---
  const handleGetLocation = () => {
    setGettingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGettingLocation(false);
          setLocationSuccess(true);
          
          // Hide success message after 3 seconds
          setTimeout(() => setLocationSuccess(false), 3000);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not detect your exact location. Please ensure location permissions are enabled in your browser.");
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 } // Ask for highly accurate GPS
      );
    } else {
      alert("Geolocation is not supported by your device/browser.");
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(formData);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">My Profile</h2>
              <p className="text-xs text-slate-500 font-medium">Save details for faster checkout</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5" /> Profile successfully updated!
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Personal Details</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
            </div>
            <div className="relative pt-2">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="tel" placeholder="Phone Number (e.g. +91 98765...)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
            </div>
          </div>

          {/* Address & GPS */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Delivery Address</label>
            </div>
            
            {/* GPS PINPOINT BUTTON */}
            <div className="pb-2">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm border cursor-pointer ${
                  formData.latitude && formData.longitude 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                    : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {gettingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                    Finding GPS Satellites...
                  </>
                ) : formData.latitude && formData.longitude ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    GPS Pinpoint Locked Successfully
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4" />
                    Detect My Exact GPS Location
                  </>
                )}
              </button>
              
              {locationSuccess && (
                <p className="text-[10px] text-emerald-600 font-bold text-center mt-1.5 animate-in fade-in">
                  Coordinates saved: {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}
                </p>
              )}
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer">
                {JAMSHEDPUR_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div className="relative pt-2">
              <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="House No. / Flat / Full Street Address" value={formData.street_address} onChange={e => setFormData({...formData, street_address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
            </div>
            <div className="relative pt-2">
              <Navigation className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Nearby Landmark (Optional)" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Profile Details"}
          </button>
        </form>

      </div>
    </div>
  );
}