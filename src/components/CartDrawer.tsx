import React, { useState, useEffect } from "react";
import { CartItem, DeliveryAddress } from "../types";
import { JAMSHEDPUR_AREAS } from "../data/paintDatabase";
import {
  ShoppingBag, Trash2, Plus, Minus, MapPin, ArrowRight,
  CheckCircle2, Package, X, CreditCard, Crosshair
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import confetti from "canvas-confetti";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onClearCart: () => void;
  currentArea: string;
  onProceedToPayment: (orderData: any) => void;
  onNavigateToOrders?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, onClose, cartItems, onUpdateQuantity, onClearCart, 
  currentArea, onProceedToPayment, onNavigateToOrders
}) => {
  const { user, profile, updateProfile } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "processing" | "success">("cart");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryOtpDisplay, setDeliveryOtpDisplay] = useState<string | null>(null);

  // --- Store Status State ---
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // --- GPS States ---
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // --- NEW: GST States ---
  const [hasGst, setHasGst] = useState(false);
  const [gstin, setGstin] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: "", phone: "", area: currentArea || "Mango",
    streetAddress: "", landmark: "", pincode: "831012", city: "Jamshedpur",
  });
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // CHECK STORE STATUS WHEN CART OPENS
 useEffect(() => {
    if (isOpen) {
      const fetchStatus = async () => {
        const { data, error } = await supabase.from('store_settings').select('is_open').eq('id', 1).single();
        
        // --- PRINT THE SECRET ERROR TO THE CONSOLE ---
        console.log("🚨 STORE STATUS CHECK -> Data:", data, "Error:", error);
        
        // Only update if we successfully got data, and explicitly set it to false if the DB says false
        if (data !== null) {
          setIsStoreOpen(data.is_open);
        }
      };
      fetchStatus();
    }
  }, [isOpen]);

  // AUTO-FILL SAVED ADDRESS WHEN CART OPENS
  useEffect(() => {
    if (isOpen && profile) {
      if (profile.saved_addresses && profile.saved_addresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(profile.saved_addresses[0].id);
      } else {
        setAddress((prev) => ({
          ...prev,
          fullName: profile.full_name || prev.fullName,
          phone: profile.phone || prev.phone,
          area: profile.area || currentArea || "Mango",
          streetAddress: profile.street_address || prev.streetAddress,
          landmark: profile.landmark || prev.landmark,
          latitude: profile.latitude || prev.latitude,
          longitude: profile.longitude || prev.longitude
        }));
      }
    }
  }, [isOpen, profile, currentArea]);

  if (!isOpen) return null;

  // --- GPS Geolocation Logic ---
  const handleGetLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAddress({
            ...address,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGettingLocation(false);
          setLocationSuccess(true);
          setTimeout(() => setLocationSuccess(false), 3000);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not detect exact location. Please ensure location permissions are enabled.");
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setGettingLocation(false);
    }
  };

  const finalTotal = cartItems.reduce((sum, item) => sum + (item.pack.price + item.tintingCharge) * item.quantity, 0);
  const totalMRP = cartItems.reduce((sum, item) => sum + (item.pack.originalPrice + item.tintingCharge) * item.quantity, 0);
  const totalSavings = totalMRP - finalTotal;
  const preGstTotal = finalTotal / 1.18;
  const gstAmount = finalTotal - preGstTotal;
  const paintSubtotal = cartItems.reduce((sum, item) => sum + item.pack.price * item.quantity, 0);
  const tintingTotal = cartItems.reduce((sum, item) => sum + (item.tintingCharge * item.quantity), 0);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      confetti({ ...defaults, particleCount: 50 * (timeLeft / duration), origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handlePaymentBypass = async () => {
    if (!user) return alert("Please login or create an account to place your order.");
    
    const finalAddress = (selectedAddressId && profile?.saved_addresses && !isAddingAddress)
      ? profile.saved_addresses.find(a => a.id === selectedAddressId) || address
      : address;
      
    if (!finalAddress.fullName || !finalAddress.phone || !finalAddress.streetAddress) return alert("Please fill in your complete delivery details.");
    if (hasGst && (!gstin || !companyName)) return alert("Please fill in your Company Name and GSTIN.");

    try {
      setCheckoutStep("processing");

      // Save newest address to user profile
      if (isAddingAddress || !profile?.saved_addresses || profile.saved_addresses.length === 0) {
        const newSavedAddress = {
          id: crypto.randomUUID(),
          type: 'Home' as const,
          fullName: finalAddress.fullName,
          phone: finalAddress.phone,
          streetAddress: finalAddress.streetAddress,
          area: finalAddress.area,
          landmark: finalAddress.landmark,
          latitude: finalAddress.latitude,
          longitude: finalAddress.longitude
        };
        const updatedAddresses = [...(profile?.saved_addresses || []), newSavedAddress];
        await updateProfile({ saved_addresses: updatedAddresses });
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const { data: dbOrder, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: Math.round(finalTotal),
          status: "paid",
          items: cartItems,
          delivery_address: finalAddress,
          delivery_otp: generatedOtp,
          // --- NEW: Injecting GST Details ---
          gst_details: hasGst ? { hasGst: true, gstin, companyName } : { hasGst: false }
        })
        .select().single();

      if (error) throw error;

      setOrderId(dbOrder.id.slice(-6).toUpperCase());
      setDeliveryOtpDisplay(generatedOtp);
      setCheckoutStep("success");
      triggerConfetti();
      onClearCart();
    } catch (err: any) {
      console.error("Test Payment error:", err);
      alert("Failed to proceed with test payment: " + err.message);
      setCheckoutStep("cart");
    }
  };

  const closeAndReset = () => {
    setCheckoutStep("cart");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeAndReset} />
      <div className="relative bg-white w-full max-w-[480px] h-screen shadow-2xl flex flex-col justify-between overflow-hidden sm:rounded-l-3xl animate-in slide-in-from-right duration-300" style={{ height: '100dvh' }}>
        
        {/* SUCCESS SCREEN */}
        {checkoutStep === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Order Confirmed!</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">Your order <span className="font-bold text-slate-800">#{orderId}</span> is confirmed and paid.</p>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full mb-8">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Verification OTP</div>
              <div className="text-4xl font-black text-indigo-600 tracking-[0.2em]">{deliveryOtpDisplay}</div>
              <div className="text-[10px] text-slate-400 mt-2">Share this code with the delivery partner.</div>
            </div>

            <button onClick={() => { closeAndReset(); if (onNavigateToOrders) onNavigateToOrders(); }} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/25 transition-all active:scale-[0.98]">
              Track My Order & View Invoice
            </button>
            <button onClick={closeAndReset} className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
              Continue Shopping
            </button>
          </div>
        )}

        {/* PROCESSING SCREEN */}
        {checkoutStep === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              <CreditCard className="absolute inset-0 m-auto w-6 h-6 text-slate-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Processing Order</h2>
            <p className="text-slate-500 text-sm">Saving to profile and generating bill...</p>
          </div>
        )}

        {/* ADDRESS SCREEN */}
        {checkoutStep === "address" && (
          <>
            <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setCheckoutStep("cart")} className="p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-50"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">Select Address</h3>
                </div>
              </div>
              <button onClick={closeAndReset} className="p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-50"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 pb-32 space-y-6">
              
              {!isAddingAddress && profile?.saved_addresses && profile.saved_addresses.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-900 tracking-tight flex items-center justify-between">
                    <span>Select Delivery Address</span>
                  </h4>
                  {profile.saved_addresses.map(savedAddr => (
                    <div 
                      key={savedAddr.id}
                      onClick={() => setSelectedAddressId(savedAddr.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                        selectedAddressId === savedAddr.id ? 'border-indigo-600 shadow-md' : 'border-slate-100 hover:border-indigo-200 shadow-sm'
                      }`}
                    >
                      {selectedAddressId === savedAddr.id && (
                        <div className="absolute top-4 right-4 text-indigo-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className={`w-4 h-4 ${selectedAddressId === savedAddr.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="font-bold text-sm text-slate-900">{savedAddr.type || 'Home'}</span>
                      </div>
                      <div className="pl-6 text-xs text-slate-500 leading-relaxed">
                        <span className="font-bold text-slate-700">{savedAddr.fullName}</span> • {savedAddr.phone}
                        <br />
                        {savedAddr.streetAddress}, {savedAddr.landmark ? `${savedAddr.landmark}, ` : ''}{savedAddr.area}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full py-3 mt-4 border-2 border-dashed border-slate-200 text-indigo-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 hover:border-indigo-200 transition"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>
              )}

              {(isAddingAddress || !profile?.saved_addresses || profile.saved_addresses.length === 0) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900 tracking-tight flex items-center justify-between">
                      <span>{profile?.saved_addresses?.length ? 'Add New Address' : 'Delivery Details'}</span>
                    </h4>
                    {isAddingAddress && profile?.saved_addresses && profile.saved_addresses.length > 0 && (
                      <button onClick={() => setIsAddingAddress(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                    )}
                  </div>
                  
                  {/* --- GPS BUTTON --- */}
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className={`w-full py-2.5 px-3 mb-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm border cursor-pointer ${
                      address.latitude && address.longitude 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                        : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {gettingLocation ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                        Finding GPS Satellites...
                      </>
                    ) : address.latitude && address.longitude ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        GPS Pinpoint Locked
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-3.5 h-3.5" />
                        Detect My Exact GPS Location
                      </>
                    )}
                  </button>
                  {/* -------------------------------------- */}

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Full Name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none" />
                    <input type="text" placeholder="Phone Number" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none">
                      {JAMSHEDPUR_AREAS.map((a) => (<option key={a} value={a}>{a}</option>))}
                    </select>
                    <input type="text" placeholder="Landmark" value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none" />
                  </div>
                  <input type="text" placeholder="Complete Street Address" value={address.streetAddress} onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 sm:pb-5 bg-white/95 backdrop-blur-md border-t border-slate-100 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <button onClick={handlePaymentBypass} className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl transition-all flex items-center justify-between cursor-pointer">
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Complete Order</div>
                  <div className="text-base font-black tracking-tight leading-none mt-0.5">₹{finalTotal.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl">
                  <span>Place Order</span><ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </>
        )}

        {/* CART SCREEN */}
        {checkoutStep === "cart" && (
          <>
            <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-full"><ShoppingBag className="w-5 h-5 text-slate-800" /></div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">Your Cart</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items</p>
                </div>
              </div>
              <button onClick={closeAndReset} className="p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-50"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 pb-32 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pb-20">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6"><ShoppingBag className="w-10 h-10 text-slate-300" /></div>
                  <h4 className="font-black text-xl text-slate-800 mb-2 tracking-tight">Your cart is empty</h4>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="group relative flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                          <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-bold text-xs text-slate-900 leading-tight line-clamp-2">{item.productName}</h5>
                              <button onClick={() => onUpdateQuantity(item.id, 0)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.pack.size}</p>
                            {item.selectedShade && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-3 h-3 rounded-full border border-slate-200 shadow-xs" style={{ backgroundColor: item.selectedShade.hex }} />
                                <span className="text-[9px] font-bold text-slate-600">{item.selectedShade.name} ({item.selectedShade.code})</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-black text-xs text-slate-900">₹{(item.pack.price + item.tintingCharge) * item.quantity}</span>
                            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                              <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-slate-900"><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-slate-900"><Plus className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>



                  {/* --- NEW: GST INVOICE SECTION --- */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasGst}
                        onChange={(e) => setHasGst(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer border-slate-300"
                      />
                      <span className="text-sm font-bold text-slate-700">I need a GST Invoice (B2B)</span>
                    </label>
                    
                    {hasGst && (
                      <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <input 
                          type="text" 
                          placeholder="Company Name" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                        />
                        <input 
                          type="text" 
                          placeholder="GSTIN Number (15 digits)" 
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          maxLength={15}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 uppercase"
                        />
                      </div>
                    )}
                  </div>
                  {/* -------------------------------------- */}

                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2.5 text-xs text-slate-600">
                    <h4 className="font-extrabold text-slate-900 tracking-tight text-sm mb-3">Bill Summary</h4>
                    
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Total MRP</span><span className="font-bold line-through">₹{totalMRP.toFixed(2)}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>You Save</span><span className="font-bold">- ₹{totalSavings.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-100">
                      <span>Selling Price (inc. taxes)</span><span className="font-bold">₹{paintSubtotal.toFixed(2)}</span>
                    </div>
                    {tintingTotal > 0 && (
                      <div className="flex justify-between items-center text-amber-700">
                        <span>Tinting Charges</span><span className="font-bold">+ ₹{tintingTotal.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 pb-1 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Base Amount (excl. GST)</span><span>₹{preGstTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>GST (18%)</span><span>₹{gstAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-2 mt-1 border-t border-slate-200 border-dashed">
                      <div>
                        <span className="font-black text-sm text-slate-900">Grand Total</span>
                      </div>
                      <span className="text-xl font-black text-slate-900">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 sm:pb-5 bg-white/95 backdrop-blur-md border-t border-slate-100 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                {isStoreOpen ? (
                  <button onClick={() => setCheckoutStep("address")} className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl transition-all flex items-center justify-between cursor-pointer">
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total</div>
                      <div className="text-base font-black tracking-tight leading-none mt-0.5">₹{finalTotal.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl">
                      <span>Checkout</span><ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ) : (
                  <div className="w-full py-3.5 px-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center shadow-sm">
                    <div className="text-sm font-black tracking-tight mb-0.5">Store is Currently Closed</div>
                    <div className="text-[11px] font-bold">Operating hours: 8:00 AM to 8:30 PM.</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};