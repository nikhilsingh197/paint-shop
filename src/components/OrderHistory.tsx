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

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</div>
                    <div className="text-sm font-black text-slate-900">#{getSafeId(order)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Placed</div>
                    <div className="text-sm font-bold text-slate-700">{getSafeDate(order)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</div>
                    <div className="text-sm font-black text-emerald-600">₹{order.total_amount || order.total}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {order.profiles && (
                    <div className="mb-6 flex items-center gap-3 bg-cyan-50/50 border border-cyan-100 p-3 rounded-xl w-fit">
                      <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Delivery Agent</div>
                        <div className="text-sm font-black text-slate-800">{order.profiles.full_name || "Assigned Driver"}</div>
                        <a href={`tel:${order.profiles.phone}`} className="text-xs font-bold text-cyan-700 hover:underline">
                          {order.profiles.phone || "Contact via Support"}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-500" /> Package Contents
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0" />
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="font-bold text-xs text-slate-900 truncate">{item.productName}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {item.pack?.size} × {item.quantity}
                              </div>
                              {item.selectedShade && (
                                <div className="mt-1 flex items-center gap-1.5 bg-white w-fit px-1.5 py-0.5 rounded border border-slate-200">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.selectedShade.hex }} />
                                  <span className="text-[9px] font-black">{item.selectedShade.code}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" /> Delivered To
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-900">{order.delivery_address?.fullName || order.customer_name || "Customer"}</span><br />
                        {order.delivery_address?.phone}<br />
                        <span className="font-bold">{order.delivery_address?.area || order.area}</span>, {order.delivery_address?.streetAddress || ""}
                        {order.delivery_address?.landmark && <span><br />Landmark: {order.delivery_address?.landmark}</span>}
                      </div>
                    </div>
                  </div>

                  {!isDelivered ? (
                    <div className="mt-6 p-4 sm:p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
                      
                      {order.delivery_otp ? (
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                            <KeyRound className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">
                              Secure Delivery OTP
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-[0.15em]">
                              {order.delivery_otp}
                            </div>
                            <div className="text-[10px] text-indigo-500 font-bold mt-1">
                              Share this OTP with the delivery partner.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full lg:w-auto text-sm font-bold text-indigo-700">
                          Preparing your order for dispatch.
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                        <a 
                          href="tel:+917004734407" 
                          className="flex items-center justify-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-xl text-xs font-bold border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                        >
                          <PhoneCall className="w-4 h-4" />
                          Call Support
                        </a>

                        <button
                          onClick={() => setViewingInvoice(order)}
                          className="flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                        >
                          <FileText className="w-4 h-4" />
                          View Invoice
                        </button>

                        <button
                          onClick={() => {
                            if (onTrackOrder) {
                              onTrackOrder(order);
                            } else {
                              alert("Live tracking component is still loading...");
                            }
                          }}
                          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                        >
                          <Navigation className="w-4 h-4" />
                          Live Tracking
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setViewingInvoice(order)}
                        className="flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        View Invoice
                      </button>
                      <a 
                        href="tel:+917004734407" 
                        className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <PhoneCall className="w-4 h-4" />
                        Contact Store Support
                      </a>
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