import React, { useState } from "react";
import { X, Search, MapPin, Plus, Home, Briefcase, Map, Crosshair, ExternalLink, MessageCircle } from "lucide-react";
import { useAuth, SavedAddress } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSelection: SavedAddress | string | null;
  onSelect: (selection: SavedAddress | string) => void;
}

const JAMSHEDPUR_AREAS = [
  "Sakchi", "Bistupur", "Kadma", "Sonari", "Telco Colony", 
  "Golmuri", "Baridih", "Mango", "Jugsalai", "Adityapur", 
  "Gamharia", "Sidhgora", "Bhalubasa", "Agradoh"
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen, onClose, currentSelection, onSelect
}) => {
  const { user, profile, updateProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [newAddress, setNewAddress] = useState<Partial<SavedAddress>>({
    type: "Home",
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    area: "Mango",
    streetAddress: "",
    landmark: ""
  });

  if (!isOpen) return null;

  const savedAddresses = profile?.saved_addresses || [];

  const handleSaveNewAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.streetAddress) {
      alert("Please fill in required fields.");
      return;
    }
    const addressToSave: SavedAddress = {
      id: uuidv4(),
      type: newAddress.type as any,
      fullName: newAddress.fullName!,
      phone: newAddress.phone!,
      streetAddress: newAddress.streetAddress!,
      area: newAddress.area!,
      landmark: newAddress.landmark || "",
      latitude: newAddress.latitude,
      longitude: newAddress.longitude
    };

    const updatedAddresses = [addressToSave, ...savedAddresses];
    await updateProfile({ saved_addresses: updatedAddresses });
    setIsAddingNew(false);
    onSelect(addressToSave);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your device.");
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setNewAddress({
        ...newAddress, 
        latitude: position.coords.latitude, 
        longitude: position.coords.longitude
      });
      alert("GPS Coordinates attached successfully! Delivery partner will use this for exact routing.");
    }, (error) => {
      alert("Unable to retrieve location. Please grant location permissions in your browser/app settings.");
    });
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "Home": return <Home className="w-5 h-5 text-emerald-600" />;
      case "Work": return <Briefcase className="w-5 h-5 text-emerald-600" />;
      default: return <MapPin className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-slate-50 w-full h-[85vh] sm:h-[80vh] sm:max-w-[480px] sm:mx-auto sm:mb-8 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Select delivery location</h2>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto np-hide-scroll">
          {isAddingNew ? (
            <div className="p-5 bg-white h-full animate-in fade-in zoom-in-95">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <button onClick={() => setIsAddingNew(false)} className="p-1 -ml-1 text-slate-400 hover:text-slate-900"><X className="w-4 h-4" /></button>
                Enter Address Details
              </h3>

              <button 
                onClick={handleUseCurrentLocation} 
                className={`w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl font-bold text-sm border transition-all active:scale-95 ${newAddress.latitude ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                <Crosshair className={`w-4 h-4 ${newAddress.latitude ? 'text-emerald-500' : 'text-slate-400'}`} />
                {newAddress.latitude ? "GPS Location Attached" : "Use Current Location"}
              </button>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((t) => (
                    <button key={t} onClick={() => setNewAddress({...newAddress, type: t as any})} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${newAddress.type === t ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Receiver Name</label>
                  <input type="text" value={newAddress.fullName} onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input type="tel" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Locality / Area</label>
                  <select value={newAddress.area} onChange={(e) => setNewAddress({...newAddress, area: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                    {JAMSHEDPUR_AREAS.map(a => <option key={a} value={a}>{a}, Jamshedpur</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">House / Flat / Block No.</label>
                  <textarea value={newAddress.streetAddress} onChange={(e) => setNewAddress({...newAddress, streetAddress: e.target.value})} rows={2} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" placeholder="e.g. Hno 42, Rd No 3, Hill View Colony" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Landmark (Optional)</label>
                  <input type="text" value={newAddress.landmark} onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" placeholder="e.g. Near Water Tank" />
                </div>

                <button onClick={handleSaveNewAddress} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-emerald-600/30 transition-all active:scale-95 mt-4">
                  Save Address & Proceed
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search for area, street name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button onClick={() => {
                  if (!user) {
                    alert("Please sign in to save addresses.");
                    return;
                  }
                  setIsAddingNew(true);
                }} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left">
                  <Plus className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-sm font-bold text-emerald-700">Add new address</div>
                </button>
              </div>

              {/* Saved Addresses */}
              {user && savedAddresses.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Your saved addresses</h3>
                  <div className="space-y-3">
                    {savedAddresses.filter(a => a.area.toLowerCase().includes(searchQuery.toLowerCase()) || a.streetAddress.toLowerCase().includes(searchQuery.toLowerCase())).map((addr) => {
                      const isSelected = typeof currentSelection === 'object' && currentSelection !== null && (currentSelection as SavedAddress).id === addr.id;
                      
                      return (
                        <div key={addr.id} onClick={() => { onSelect(addr); onClose(); }} className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'border-emerald-500 shadow-md shadow-emerald-100 bg-emerald-50/10' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}>
                          <div className="flex gap-4">
                            <div className="mt-1 shrink-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {renderIcon(addr.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-extrabold text-slate-900 text-sm">{addr.type}</h4>
                                {isSelected && <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1"><MapPin className="w-3 h-3" /> Selected</span>}
                              </div>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-1.5 line-clamp-2">
                                {addr.streetAddress}, {addr.area}, {addr.landmark ? `Near ${addr.landmark}, ` : ''}Jamshedpur
                              </p>
                              <div className="text-[11px] font-bold text-slate-400">
                                Phone number: <span className="text-slate-700">{addr.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Generic Areas (For users without saved addresses) */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Or choose a locality</h3>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {JAMSHEDPUR_AREAS.filter(a => a.toLowerCase().includes(searchQuery.toLowerCase())).map((area, idx) => {
                    const isSelected = currentSelection === area;
                    return (
                      <button key={area} onClick={() => { onSelect(area); onClose(); }} className={`w-full flex items-center justify-between px-4 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors text-left ${isSelected ? 'bg-emerald-50/50' : ''}`}>
                        <div className="flex items-center gap-3">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>{area}, Jamshedpur</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="h-10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
