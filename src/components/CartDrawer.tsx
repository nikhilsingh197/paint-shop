import React, { useState, useEffect } from "react";
import { CartItem, DeliveryAddress, LoyaltyProfile } from "../types";
import { JAMSHEDPUR_AREAS } from "../data/paintDatabase";
import {
  ShoppingBag, Trash2, Plus, Minus, MapPin, ArrowRight,
  CheckCircle2, Package, X, CreditCard, Crosshair // <-- Added Crosshair
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
  loyalty: LoyaltyProfile;
  onProceedToPayment: (orderData: any) => void;
  onNavigateToOrders?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, onClose, cartItems, onUpdateQuantity, onClearCart, 
  currentArea, loyalty, onNavigateToOrders
}) => {
  const { user, profile, updateProfile } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "processing" | "success">("cart");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryOtpDisplay, setDeliveryOtpDisplay] = useState<string | null>(null);
  const [useLoyaltyCoins, setUseLoyaltyCoins] = useState(true);

  // --- NEW: GPS States ---
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: "", phone: "", area: currentArea || "Mango",
    streetAddress: "", landmark: "", pincode: "831012", city: "Jamshedpur",
  });

  // AUTO-FILL SAVED ADDRESS WHEN CART OPENS
  useEffect(() => {
    if (isOpen && profile) {
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
  }, [isOpen, profile, currentArea]);

  if (!isOpen) return null;

  // --- NEW: GPS Geolocation Logic ---
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

  const paintSubtotal = cartItems.reduce((sum, item) => sum + item.pack.price * item.quantity, 0);
  const tintingTotal = cartItems.reduce((sum, item) => sum + (item.tintingCharge * item.quantity), 0);
  const preGstTotal = paintSubtotal + tintingTotal;
  const gstAmount = preGstTotal * 0.18;

  const currentCoins = profile ? profile.rang_coins : loyalty.rangCoins;
  const maxCoinsToUse = Math.min(currentCoins, 400);
  const loyaltyDiscount = useLoyaltyCoins ? Math.min(maxCoinsToUse * 0.5, preGstTotal * 0.15) : 0;
  const finalTotal = Math.max(0, preGstTotal + gstAmount - loyaltyDiscount);

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
    if (!address.fullName || !address.phone || !address.streetAddress) return alert("Please fill in your complete delivery details.");

    try {
      setCheckoutStep("processing");

      // Save newest address (including GPS) to user profile
      await updateProfile({
        full_name: address.fullName,
        phone: address.phone,
        street_address: address.streetAddress,
        area: address.area,
        landmark: address.landmark,
        latitude: address.latitude,   // Save new GPS to profile
        longitude: address.longitude  // Save new GPS to profile
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const { data: dbOrder, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: Math.round(finalTotal),
          status: "paid",
          items: cartItems,
          delivery_address: address,
          delivery_otp: generatedOtp 
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
      <div className="relative bg-white w-full max-w-[480px] h-full shadow-2xl flex flex-col justify-between overflow-hidden sm:rounded-l-3xl animate-in slide-in-from-right duration-300">
        
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
              Track My Order
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

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
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

                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-900 tracking-tight flex items-center justify-between">
                      <span>Delivery Details</span>
                    </h4>
                    
                    {/* --- GPS BUTTON ADDED DIRECTLY IN CART --- */}
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

                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2.5 text-xs text-slate-600">
                    <h4 className="font-extrabold text-slate-900 tracking-tight text-sm mb-3">Bill Summary</h4>
                    <div className="flex justify-between items-center">
                      <span>Paint Subtotal</span><span className="font-bold text-slate-900">₹{paintSubtotal.toFixed(2)}</span>
                    </div>
                    {tintingTotal > 0 && (
                      <div className="flex justify-between items-center text-amber-700">
                        <span>Tinting Charges</span><span className="font-bold">+ ₹{tintingTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-100">
                      <span>GST (18%)</span><span className="font-bold">+ ₹{gstAmount.toFixed(2)}</span>
                    </div>
                    {loyaltyDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 pt-1">
                        <span>Rang Club Discount</span><span className="font-bold">- ₹{loyaltyDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end pt-1">
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
              <div className="p-5 bg-white/90 backdrop-blur-md border-t border-slate-100 z-20">
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
            )}
          </>
        )}
      </div>
    </div>
  );
};