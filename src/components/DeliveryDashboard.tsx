import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Truck, Navigation, CheckCircle2, Package, MapPin, Phone, User, ShieldCheck, KeyRound } from "lucide-react";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAssignedOrders();
    }
  }, [user]);

  const fetchAssignedOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("delivery_partner_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setAssignedOrders(data || []);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (orderId: string, correctOtp: string) => {
    const enteredOtp = otpInputs[orderId]?.trim();
    if (!enteredOtp) {
      alert("Please enter the 4-digit delivery OTP provided by the customer.");
      return;
    }

    if (enteredOtp !== correctOtp) {
      alert("Incorrect OTP! Please ask the customer for the correct 4-digit code.");
      return;
    }

    setVerifyingId(orderId);

    // Update order status to delivered in Supabase
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);

    if (error) {
      alert("Failed to complete delivery: " + error.message);
    } else {
      alert("🎉 Delivery successfully completed!");
      fetchAssignedOrders();
    }
    setVerifyingId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold">Loading Assigned Deliveries...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-8 bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-md">
          <Truck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Delivery Partner Portal</h1>
          <p className="text-cyan-400 font-medium mt-1 text-xs sm:text-sm">
            Logged in as: {user?.email} • View route and enter customer OTP upon drop-off.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {assignedOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No active deliveries assigned</h3>
            <p className="text-slate-500 text-xs mt-1">Check back once the store manager assigns an order to you from the Admin Dashboard.</p>
          </div>
        ) : (
          assignedOrders.map((order) => {
            const address = order.delivery_address || {};
            const isDelivered = order.status === "delivered";

            return (
              <div key={order.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isDelivered ? 'border-emerald-200 bg-emerald-50/20 opacity-75' : 'border-slate-200'}`}>
                
                {/* Order Top Bar */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</div>
                    <div className="text-base font-black text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Amount</div>
                    <div className="text-base font-black text-emerald-600">₹{order.total_amount}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold mt-0.5 ${isDelivered ? 'bg-emerald-100 text-emerald-800' : 'bg-cyan-100 text-cyan-800'}`}>
                      {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                      {isDelivered ? 'Delivered' : 'Out for Delivery'}
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Customer & Address */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" /> Customer Destination
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <User className="w-4 h-4 text-slate-400" /> {address.fullName || "Customer"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-4 h-4 text-slate-400" /> 
                        <a href={`tel:${address.phone}`} className="text-blue-600 hover:underline font-bold">{address.phone}</a>
                      </div>
                      <div className="text-xs text-slate-600 pt-1 leading-relaxed">
                        <span className="font-bold text-slate-800">{address.area}</span>, {address.streetAddress}
                        {address.landmark && <span className="block text-slate-500 mt-0.5">Landmark: {address.landmark}</span>}
                      </div>
                    </div>

                    {/* GPS Navigation Button */}
                    {address.latitude && address.longitude ? (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Navigation className="w-4 h-4" /> Start GPS Turn-by-Turn Navigation
                      </a>
                    ) : (
                      <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl font-medium text-center">
                        Customer did not share exact GPS coordinates. Use street address above.
                      </div>
                    )}
                  </div>

                  {/* Right: Items & OTP Verification */}
                  <div className="flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-500" /> Package Contents
                      </h4>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-800 truncate max-w-[200px]">{item.productName}</span>
                            <span className="text-slate-500 font-medium">{item.pack?.size} × {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* OTP Input & Verification Box */}
                    {!isDelivered ? (
                      <div className="bg-slate-900 p-4 rounded-xl text-white space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                          <KeyRound className="w-4 h-4" /> Enter Customer Delivery OTP
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="4-digit OTP"
                            value={otpInputs[order.id] || ""}
                            onChange={(e) => setOtpInputs({ ...otpInputs, [order.id]: e.target.value })}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono tracking-widest w-32 outline-none focus:border-cyan-500 text-center"
                          />
                          <button
                            onClick={() => handleVerifyOtp(order.id, order.delivery_otp)}
                            disabled={verifyingId === order.id}
                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs py-2 px-4 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
                          >
                            {verifyingId === order.id ? "Verifying..." : "Verify & Complete"}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">Ask the customer for the 4-digit verification code sent to their app upon ordering.</p>
                      </div>
                    ) : (
                      <div className="bg-emerald-100 border border-emerald-300 p-4 rounded-xl text-emerald-900 flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs">Delivery Verified & Completed</div>
                          <div className="text-[10px] text-emerald-700 mt-0.5">The payment and order have been successfully closed.</div>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}