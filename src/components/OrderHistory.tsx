import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  Package, Truck, CheckCircle2, Clock, PaintBucket,
  Droplet, Box, UserCheck, PhoneCall, ShoppingBag,
  MapPin, KeyRound, Navigation, FileText
} from "lucide-react";
import { InvoiceModal } from "./InvoiceModal"; 

// --- BULLETPROOF DATA HELPERS ---
const getSafeId = (order: any) => {
  const id = order?.id || order?.order_id || order?.orderId;
  if (!id) return "PENDING";
  const str = String(id);
  return str.includes("-") ? str.split("-")[0].toUpperCase() : str.slice(0, 8).toUpperCase();
};

const getSafeDate = (order: any) => {
  const rawDate = order?.created_at || order?.timestamp || order?.date;
  if (!rawDate) return "N/A";
  try {
    return new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return "N/A";
  }
};

const ORDER_STATUSES = [
  { id: "paid", label: "Order Placed", icon: Clock, color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200" },
  { id: "getting_ready", label: "Preparing Paints", icon: PaintBucket, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" },
  { id: "tinted", label: "Tinting Colors", icon: Droplet, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" },
  { id: "packed", label: "Order Packed", icon: Box, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200" },
  { id: "assigned", label: "Driver Assigned", icon: UserCheck, color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-200" },
  { id: "out_for_delivery", label: "Out for Delivery", icon: Truck, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
  { id: "delivered", label: "Delivered", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
];

interface OrderHistoryProps {
  orders?: any[]; 
  onReorder?: (order: any) => void;
  onTrackOrder?: (order: any) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders = [], onReorder, onTrackOrder }) => {
  const { user } = useAuth();
  
  // We ONLY use this state now. No fallbacks to local dummy data.
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    
    const { data: ordersData, error } = await supabase
  .from("orders")
  .select("*")
  .eq("user_id", user?.id)
  .order("created_at", { ascending: false });

console.log("ACTUAL DB DATA:", ordersData);
    if (error) {
      console.error("Failed to fetch orders from Supabase:", error);
      setDbOrders([]); // Force empty on error
      setLoading(false);
      return;
    }

    if (!ordersData || ordersData.length === 0) {
      setDbOrders([]); // Force empty if no orders exist
      setLoading(false);
      return;
    }

    const partnerIds = ordersData
      .map(o => o.delivery_partner_id)
      .filter(Boolean);

    if (partnerIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", partnerIds);

      if (profilesData) {
        const profileMap = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);

        ordersData.forEach(order => {
          if (order.delivery_partner_id) {
            order.profiles = profileMap[order.delivery_partner_id];
          }
        });
      }
    }

    setDbOrders(ordersData);
    setLoading(false);
  };

  const getStatusConfig = (statusId: string) => {
    return ORDER_STATUSES.find((s) => s.id === statusId) || ORDER_STATUSES[0];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold">Loading your past orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm max-w-2xl mx-auto mt-10">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Please Login</h3>
        <p className="text-slate-500 text-xs mt-1">Log in to your account to view your order history.</p>
      </div>
    );
  }

  // --- THE FIX: STRICTLY USE DATABASE ORDERS ONLY ---
  const displayOrders = dbOrders; 

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Past Orders & Tracking</h1>
        <p className="text-slate-500 font-medium mt-1 text-sm">Track your live deliveries and review previous purchases.</p>
      </div>

      <div className="space-y-6">
        {displayOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No orders found</h3>
            <p className="text-slate-500 text-xs mt-1">When you buy paints, your order history will appear here.</p>
          </div>
        ) : (
          displayOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isDelivered = order.status === "delivered";

            const timelineSteps = [
              { id: "paid", label: "Order Placed" },
              { id: "getting_ready", label: "Preparing" },
              { id: "tinted", label: "Tinting" },
              { id: "packed", label: "Packed" },
              { id: "out_for_delivery", label: "Out for Delivery" },
              { id: "delivered", label: "Delivered" }
            ];
            
            const currentStepIndex = timelineSteps.findIndex(s => s.id === order.status);
            const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-white">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Order ID</div>
                    <div className="text-sm font-black tracking-widest text-emerald-400">#{getSafeId(order)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date Placed</div>
                    <div className="text-sm font-bold">{getSafeDate(order)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Amount</div>
                    <div className="text-sm font-black text-white">₹{order.total_amount || order.total}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black shadow-inner bg-white/10 text-white border border-white/20`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Timeline */}
                  <div className="mb-8 overflow-x-auto pb-4 np-hide-scroll">
                    <div className="flex items-center min-w-[500px]">
                      {timelineSteps.map((step, index) => {
                        const isCompleted = index < activeIndex;
                        const isCurrent = index === activeIndex;
                        return (
                          <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center relative z-10 w-24">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                                isCompleted ? 'bg-emerald-500 text-white' : 
                                isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 
                                'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-wider mt-2 text-center leading-tight ${
                                isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                            {index < timelineSteps.length - 1 && (
                              <div className="flex-1 h-1.5 -ml-4 -mr-4 rounded-full relative z-0">
                                <div className={`absolute inset-0 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {order.profiles && (
                    <div className="mb-6 flex items-center gap-3 bg-cyan-50/50 border border-cyan-100 p-4 rounded-2xl w-full">
                      <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center shrink-0">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-0.5">Delivery Agent</div>
                        <div className="text-sm font-black text-slate-800">{order.profiles.full_name || "Assigned Driver"}</div>
                      </div>
                      <a href={`tel:${order.profiles.phone}`} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-cyan-700 hover:bg-cyan-100 transition-colors shadow-sm border border-cyan-200">
                        <PhoneCall className="w-3.5 h-3.5" /> Call Agent
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-500" /> Package Contents
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-3 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
                            <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0" />
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="font-extrabold text-[11px] text-slate-900 leading-tight line-clamp-1">{item.productName}</div>
                              <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                                {item.pack?.size} × {item.quantity}
                              </div>
                              {item.selectedShade && (
                                <div className="mt-1.5 flex items-center gap-1.5 bg-slate-50 w-fit px-2 py-0.5 rounded-md border border-slate-200">
                                  <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: item.selectedShade.hex }} />
                                  <span className="text-[9px] font-black text-slate-700 tracking-wider">{item.selectedShade.code} - {item.selectedShade.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500" /> Delivered To
                        </h4>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-xs font-medium text-slate-600 leading-relaxed shadow-sm">
                          <span className="font-black text-sm text-slate-900 block mb-1">{order.delivery_address?.fullName || order.customer_name || "Customer"}</span>
                          <span className="font-bold text-slate-500 block mb-2">{order.delivery_address?.phone}</span>
                          <span className="font-bold text-slate-800">{order.delivery_address?.area || order.area}</span>, {order.delivery_address?.streetAddress || ""}
                          {order.delivery_address?.landmark && <span className="block mt-1 pt-1 border-t border-slate-100 text-slate-500">Landmark: {order.delivery_address?.landmark}</span>}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200/50 grid grid-cols-2 gap-2">
                         <button
                           onClick={() => setViewingInvoice(order)}
                           className="flex flex-col items-center justify-center gap-1.5 bg-white text-slate-700 py-3 rounded-xl text-[10px] font-black border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors uppercase tracking-wider"
                         >
                           <FileText className="w-4 h-4 text-slate-400" />
                           View Invoice
                         </button>
                         <a 
                           href="tel:+917004734407" 
                           className="flex flex-col items-center justify-center gap-1.5 bg-white text-slate-700 py-3 rounded-xl text-[10px] font-black border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors uppercase tracking-wider"
                         >
                           <PhoneCall className="w-4 h-4 text-slate-400" />
                           Store Support
                         </a>
                      </div>
                    </div>
                  </div>

                  {!isDelivered && (
                    <div className="mt-6 p-5 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                      
                      {order.delivery_otp ? (
                        <div className="flex items-center gap-5 w-full md:w-auto">
                          <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
                            <KeyRound className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                              Secure Delivery OTP
                            </div>
                            <div className="text-3xl font-black text-indigo-950 tracking-[0.2em] leading-none">
                              {order.delivery_otp}
                            </div>
                            <div className="text-[10px] font-bold text-indigo-500 mt-1.5 bg-white/60 inline-block px-2 py-0.5 rounded-full">
                              Share with delivery partner
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full md:w-auto text-sm font-bold text-indigo-700">
                          Preparing your order for dispatch...
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          if (onTrackOrder) {
                            onTrackOrder(order);
                          } else {
                            alert("Live tracking component is still loading...");
                          }
                        }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-xs font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all cursor-pointer w-full md:w-auto hover:-translate-y-0.5"
                      >
                        <Navigation className="w-4 h-4" />
                        Live Map Tracking
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {viewingInvoice && (
        <InvoiceModal 
          order={viewingInvoice} 
          onClose={() => setViewingInvoice(null)} 
        />
      )}
    </div>
  );
};