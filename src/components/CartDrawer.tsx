import React, { useState, useEffect, useRef } from "react";
import { CartItem, DeliveryAddress } from "../types";
import { JAMSHEDPUR_AREAS } from "../data/paintDatabase";
import {
  ShoppingBag, Trash2, Plus, Minus, MapPin, ArrowRight,
  CheckCircle2, Package, X, CreditCard, Crosshair, Truck, Home, Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import confetti from "canvas-confetti";
import { useToast } from "./Toast";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onClearCart: () => void;
  currentLocation: any;
  onRequestLocationChange: () => void;
  onProceedToPayment: (orderData: any) => void;
  onNavigateToOrders?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, onClose, cartItems, onUpdateQuantity, onClearCart, 
  currentLocation, onRequestLocationChange, onProceedToPayment, onNavigateToOrders
}) => {
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useToast();

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
    fullName: "", phone: "", area: typeof currentLocation === 'string' ? currentLocation : (currentLocation?.area || "Mango"),
    streetAddress: "", landmark: "", pincode: "831012", city: "Jamshedpur",
  });
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  // Track last processed profile to avoid re-running autofill on every isOpen change
  const autofillDoneRef = useRef(false);

  // CHECK STORE STATUS WHEN CART OPENS — with AbortController to prevent stacked calls
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings').select('is_open').eq('id', 1).single();
        if (!controller.signal.aborted && data !== null) {
          setIsStoreOpen(data.is_open);
        }
      } catch (err) {
        // Silently ignore — store defaults to open
      }
    };
    fetchStatus();
    return () => controller.abort();
  }, [isOpen]);

  // SYNC AREA WITH GLOBAL HEADER — only update area, don't fetch
  useEffect(() => {
    if (isOpen) {
      setAddress((prev) => ({ ...prev, area: typeof currentLocation === 'string' ? currentLocation : (currentLocation?.area || "Mango") }));
    }
  }, [isOpen, currentLocation]);

  // AUTO-FILL SAVED ADDRESS WHEN CART OPENS — only run once per profile load
  useEffect(() => {
    if (isOpen && profile && !autofillDoneRef.current) {
      autofillDoneRef.current = true;
      if (profile.saved_addresses && profile.saved_addresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(profile.saved_addresses[0].id);
      } else if (!profile.saved_addresses || profile.saved_addresses.length === 0) {
        setAddress((prev) => ({
          ...prev,
          fullName: profile.full_name || prev.fullName,
          phone: profile.phone || prev.phone,
          streetAddress: profile.street_address || prev.streetAddress,
          landmark: profile.landmark || prev.landmark,
          latitude: profile.latitude || prev.latitude,
          longitude: profile.longitude || prev.longitude
        }));
      }
    }
    // Reset autofill guard when cart closes so it can re-run if profile changes
    if (!isOpen) autofillDoneRef.current = false;
  }, [isOpen, profile]);

  if (!isOpen) {
    // Return a hidden placeholder instead of null to preserve component state
    // (address fields, GST data, checkoutStep) across open/close cycles
    return <div aria-hidden="true" style={{ display: 'none' }} />;
  }

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
          showToast("Could not detect exact location. Please ensure location permissions are enabled.", "warning");
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      showToast("Geolocation is not supported by your browser.", "warning");
      setGettingLocation(false);
    }
  };

  const itemsTotal = cartItems.reduce((sum, item) => sum + (item.pack.price + item.tintingCharge) * item.quantity, 0);
  const totalMRP = cartItems.reduce((sum, item) => sum + (item.pack.originalPrice + item.tintingCharge) * item.quantity, 0);
  const totalSavings = totalMRP - itemsTotal;
  const paintSubtotal = cartItems.reduce((sum, item) => sum + item.pack.price * item.quantity, 0);
  const tintingTotal = cartItems.reduce((sum, item) => sum + (item.tintingCharge * item.quantity), 0);

  // --- Dynamic Delivery & Zone Logic ---
  const activeArea = (selectedAddressId && profile?.saved_addresses && !isAddingAddress)
    ? (profile.saved_addresses.find((a: any) => a.id === selectedAddressId)?.area || address.area)
    : address.area;

  const getZoneConfig = (area: string) => {
    const lowerArea = (area || "").toLowerCase();
    if (['mango', 'dimna', 'pardih', 'baliguma'].some(a => lowerArea.includes(a))) return { fee: 39, threshold: 500 };
    if (['sakchi', 'bhuiyadih', 'agrico', 'bhalubasa'].some(a => lowerArea.includes(a))) return { fee: 59, threshold: 1000 };
    if (['bistupur', 'kadma', 'sonari', 'sidhgora'].some(a => lowerArea.includes(a))) return { fee: 89, threshold: 2500 };
    return { fee: 149, threshold: 5000 };
  };

  const zoneConfig = getZoneConfig(activeArea);
  const qualifiesForFreeDelivery = itemsTotal >= zoneConfig.threshold;
  const deliveryFee = qualifiesForFreeDelivery ? 0 : zoneConfig.fee;

  // --- Heavy Item Handling Surcharge ---
  let handlingSurcharge = 0;
  cartItems.forEach(item => {
    if (item.pack.size.includes('10') || item.pack.size.includes('20') || item.pack.volumeLiters >= 10) {
      handlingSurcharge += 40 * item.quantity;
    }
  });

  const finalTotal = itemsTotal + deliveryFee + handlingSurcharge;
  const preGstTotal = finalTotal / 1.18;
  const gstAmount = finalTotal - preGstTotal;

  const amountRemaining = Math.max(0, zoneConfig.threshold - itemsTotal);
  const progressPercent = Math.min(100, (itemsTotal / zoneConfig.threshold) * 100);

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

  const handleInitiateCheckout = () => {
    if (!user) {
      showToast("Please login or create an account to place your order.", "warning");
      return;
    }
    
    if (typeof currentLocation === 'string') {
      onRequestLocationChange();
      return;
    }

    const finalAddress = currentLocation;
      
    if (!finalAddress.fullName || !finalAddress.phone || !finalAddress.streetAddress) {
      showToast("Please fill in your complete delivery details.", "warning");
      return;
    }
    if (hasGst && (!gstin || !companyName)) {
      showToast("Please fill in your Company Name and GSTIN.", "warning");
      return;
    }

    onProceedToPayment({
      items: cartItems,
      address: finalAddress,
      deliverySlot: "Express Delivery (35 mins)",
      subtotal: itemsTotal,
      tintingCharges: 0,
      deliveryFee: deliveryFee,
      loyaltyDiscount: 0,
      tax: gstAmount,
      total: finalTotal
    });
  };

  const closeAndReset = () => {
    setCheckoutStep("cart");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
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
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setCheckoutStep("cart")} className="p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-50 cursor-pointer"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">Delivery Address</h3>
                </div>
              </div>
              <button onClick={closeAndReset} className="p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-50 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {/* Checkout Progress Stepper */}
            <div className="px-6 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setCheckoutStep("cart")}>
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                  ✓
                </div>
                <span className="text-[11px] font-bold text-emerald-800">Cart</span>
              </div>
              <div className="flex-1 mx-2.5 h-0.5 bg-emerald-500 rounded-full" />
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                  2
                </div>
                <span className="text-[11px] font-extrabold text-slate-900">Address</span>
              </div>
              <div className="flex-1 mx-2.5 h-0.5 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-1.5 opacity-60">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  3
                </div>
                <span className="text-[11px] font-bold text-slate-500">Pay</span>
              </div>
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
            
            <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-[448px] z-[100] pointer-events-none animate-in slide-in-from-bottom-5">
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-[22px] shadow-[0_20px_55px_-20px_rgba(0,0,0,0.3)] border border-slate-200 pointer-events-auto">
                <button onClick={handleInitiateCheckout} className="w-full py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-black text-white shadow-xl transition-all flex items-center justify-between cursor-pointer active:scale-95">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Secure Checkout</div>
                    <div className="text-base font-black tracking-tight leading-none mt-0.5">₹{finalTotal.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl">
                    <span>Proceed to Pay</span><ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* CART SCREEN */}
        {checkoutStep === "cart" && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-full"><ShoppingBag className="w-5 h-5 text-slate-800" /></div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">Your Cart</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items</p>
                </div>
              </div>
              <button onClick={closeAndReset} className="p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-50 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {/* Checkout Progress Stepper */}
            {cartItems.length > 0 && (
              <div className="px-6 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                    1
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900">Cart</span>
                </div>
                <div className="flex-1 mx-2.5 h-0.5 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-1.5 opacity-60">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                    2
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Address</span>
                </div>
                <div className="flex-1 mx-2.5 h-0.5 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-1.5 opacity-60">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                    3
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Pay</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 pb-32 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pb-20">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6"><ShoppingBag className="w-10 h-10 text-slate-300" /></div>
                  <h4 className="font-black text-xl text-slate-800 mb-2 tracking-tight">Your cart is empty</h4>
                </div>
              ) : (
                <>
                  {/* --- NEW: Free Delivery Gamified Progress Bar --- */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Truck className={`w-4 h-4 ${qualifiesForFreeDelivery ? 'text-emerald-500' : 'text-indigo-500'}`} />
                        <span className="text-xs font-bold text-slate-800">
                          {qualifiesForFreeDelivery 
                            ? "🎉 You have unlocked FREE Delivery!" 
                            : `Add ₹${amountRemaining.toFixed(0)} more to get FREE Delivery!`}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-out ${qualifiesForFreeDelivery ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  {/* ----------------------------------------------- */}

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
                    
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Delivery Fee</span>
                      <span className="font-bold">
                        {qualifiesForFreeDelivery ? (
                          <>
                            <span className="line-through text-slate-400 mr-2">₹{zoneConfig.fee}</span>
                            <span className="text-emerald-600">FREE</span>
                          </>
                        ) : (
                          `+ ₹${deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    {handlingSurcharge > 0 && (
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Heavy Item Handling</span>
                        <span className="font-bold">+ ₹{handlingSurcharge.toFixed(2)}</span>
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
              <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-[448px] z-[100] pointer-events-none animate-in slide-in-from-bottom-5">
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-[22px] shadow-[0_20px_55px_-20px_rgba(0,0,0,0.3)] border border-slate-200 pointer-events-auto">
                  {isStoreOpen ? (
                    <>
                      <div className="flex items-center justify-between mb-3 px-1 border-b border-slate-100 pb-3">
                        <div className="flex items-start gap-2">
                          <Home className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              Delivering to {typeof currentLocation === 'object' ? currentLocation.type || "Address" : "Location"}
                            </div>
                            <div className="text-[10px] font-medium text-slate-500 line-clamp-1 max-w-[220px]">
                              {typeof currentLocation === 'object' ? `${currentLocation.streetAddress}, ${currentLocation.area}` : `${currentLocation}, Jamshedpur`}
                            </div>
                          </div>
                        </div>
                        <button onClick={onRequestLocationChange} className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">Change</button>
                      </div>
                      <button onClick={handleInitiateCheckout} className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-between cursor-pointer active:scale-95">
                        <div className="text-left">
                          <div className="text-[10px] text-emerald-100 uppercase tracking-wider font-bold flex items-center gap-1">
                            Total
                          </div>
                          <div className="text-base font-black tracking-tight leading-none mt-0.5">₹{finalTotal.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl">
                          <span>Place Order</span><ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-3.5 px-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-center shadow-sm">
                      <div className="text-sm font-black tracking-tight mb-0.5">Store is Currently Closed</div>
                      <div className="text-[11px] font-bold">Operating hours: 8:00 AM to 8:30 PM.</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};