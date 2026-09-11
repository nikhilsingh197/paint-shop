import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User,
  PaintBucket,
  Droplet,
  Box,
  UserCheck,
  Tags,
  Edit,
  Plus,
  Search,
  Save,
  X,
  Trash2,
  RefreshCw,
  AlertCircle,
  Shield,
  Users,
  ClipboardList,
  Store // <-- Added for the Open/Close switch
} from "lucide-react";

const ORDER_STATUSES = [
  { id: "paid", label: "New / Paid", icon: Clock, color: "text-rose-600", bg: "bg-rose-100" },
  { id: "getting_ready", label: "Paints Getting Ready", icon: PaintBucket, color: "text-amber-600", bg: "bg-amber-100" },
  { id: "tinted", label: "Paint Tinted", icon: Droplet, color: "text-purple-600", bg: "bg-purple-100" },
  { id: "packed", label: "Order Packed", icon: Box, color: "text-indigo-600", bg: "bg-indigo-100" },
  { id: "assigned", label: "Parcel Assigned", icon: UserCheck, color: "text-cyan-600", bg: "bg-cyan-100" },
  { id: "delivered", label: "Delivered", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
];

import { PaintingLead } from "../types";
import { fetchPaintingLeads, assignContractorToLead } from "../lib/paintingLeadsApi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "leads">("orders");

  // --- Store Status State ---
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // --- Orders & Delivery Partners State ---
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // --- Inventory State ---
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // --- Leads State ---
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    fetchStoreStatus();
    
    if (activeTab === "orders") {
      fetchOrders();
      fetchDeliveryPartners(); 
    } else if (activeTab === "inventory") {
      fetchProducts();
    } else if (activeTab === "leads") {
      fetchLeads();
    }
  }, [activeTab]);

  // =====================
  // STORE STATUS LOGIC
  // =====================
  const fetchStoreStatus = async () => {
    const { data } = await supabase.from('store_settings').select('is_open').eq('id', 1).single();
    if (data) setIsStoreOpen(data.is_open);
  };

  const toggleStoreStatus = async () => {
    const newStatus = !isStoreOpen;
    setIsStoreOpen(newStatus); // Update UI instantly
    await supabase.from('store_settings').update({ is_open: newStatus }).eq('id', 1);
  };

  // =====================
  // ORDER MANAGEMENT LOGIC
  // =====================
  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, profiles!delivery_partner_id(full_name, phone)") 
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoadingOrders(false);
  };

  const fetchDeliveryPartners = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .eq("role", "delivery");
    
    if (!error) setDeliveryPartners(data || []);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);

    if (!error) {
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setUpdatingId(null);
  };

  const assignDeliveryPartner = async (orderId: string, partnerId: string) => {
    setUpdatingId(orderId);
    
    const { error } = await supabase
      .from("orders")
      .update({ 
        delivery_partner_id: partnerId || null,
        status: partnerId ? "assigned" : "packed" 
      })
      .eq("id", orderId);

    if (error) {
      alert("Failed to assign partner: " + error.message);
    } else {
      fetchOrders(); 
    }
    setUpdatingId(null);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusConfig = (statusId: string) => {
    return ORDER_STATUSES.find((s) => s.id === statusId) || ORDER_STATUSES[0];
  };

  // =====================
  // INVENTORY LOGIC
  // =====================
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
    setLoadingProducts(false);
  };

  const handleCreateProduct = () => {
    setEditingProduct({
      id: `NK-PROD-${Date.now()}`, name: "", brand: "Asian Paints", category: "Interior Emulsion", tagline: "", finish: "Matt", image: "",
      hsn_code: "3208", 
      requiresShade: true, is_active: true, rating: 4.5, reviewsCount: 0, deliveryMinutes: 35, coveragePerLiter: "100 sq.ft / 2 coats",
      washability: "Medium", features: JSON.stringify(["Computerized tinting available", "Fast delivery"]),
      packs: [{ size: "1 Litre", volumeLiters: 1, price: 500, originalPrice: 600, inStock: true }]
    });
  };

  const handleEditProduct = (product: any) => {
    const prodToEdit = { ...product };
    if (typeof prodToEdit.packs === 'string') { try { prodToEdit.packs = JSON.parse(prodToEdit.packs); } catch(e) { prodToEdit.packs = []; } }
    if (!prodToEdit.packs) prodToEdit.packs = [];
    setEditingProduct(prodToEdit);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingProduct(true);
    const { error } = await supabase.from("products").upsert({
      id: editingProduct.id, name: editingProduct.name, brand: editingProduct.brand, category: editingProduct.category, tagline: editingProduct.tagline || "",
      finish: editingProduct.finish || "Matt", image: editingProduct.image || "", requiresShade: editingProduct.requiresShade ?? true,
      hsn_code: editingProduct.hsn_code || "3208",
      is_active: editingProduct.is_active ?? true, rating: editingProduct.rating || 4.5, reviewsCount: editingProduct.reviewsCount || 0,
      deliveryMinutes: editingProduct.deliveryMinutes || 35, coveragePerLiter: editingProduct.coveragePerLiter || "", washability: editingProduct.washability || "Medium",
      features: typeof editingProduct.features === 'string' ? editingProduct.features : JSON.stringify(editingProduct.features || []),
      packs: editingProduct.packs || []
    });
    if (!error) { setEditingProduct(null); fetchProducts(); }
    setSavingProduct(false);
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", id);
    if (!error) fetchProducts();
  };

  const updatePack = (index: number, field: string, value: any) => {
    const newPacks = [...editingProduct.packs]; newPacks[index] = { ...newPacks[index], [field]: value };
    setEditingProduct({ ...editingProduct, packs: newPacks });
  };
  
  const addPack = () => { setEditingProduct({ ...editingProduct, packs: [...(editingProduct.packs || []), { size: "4 Litres", volumeLiters: 4, price: 2000, originalPrice: 2200, inStock: true }] }); };
  
  const removePack = (index: number) => { const newPacks = [...editingProduct.packs]; newPacks.splice(index, 1); setEditingProduct({ ...editingProduct, packs: newPacks }); };

  const filteredInventory = products.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()));

  // =====================
  // LEADS LOGIC
  // =====================
  const fetchLeads = async () => {
    setLoadingLeads(true);
    const data = await fetchPaintingLeads();
    setLeads(data);
    setLoadingLeads(false);
  };

  const handleAssignContractor = async (id: string, name: string, phone: string) => {
    const success = await assignContractorToLead(id, `${name} - ${phone}`);
    if (success) {
      fetchLeads();
    } else {
      alert("Failed to assign contractor. Ensure Supabase table 'painting_leads' has 'assigned_contractor' and 'status' columns.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      
      {/* Top Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            {activeTab === "orders" && <Package className="w-7 h-7" />}
            {activeTab === "inventory" && <Tags className="w-7 h-7" />}
            {activeTab === "leads" && <Users className="w-7 h-7" />}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Store Owner Panel</h1>
            <p className="text-slate-500 font-medium mt-1 text-xs sm:text-sm">
              {activeTab === "orders" && "Manage pipeline and fulfill customer deliveries."}
              {activeTab === "inventory" && "Manage paint database, pricing, and stock."}
              {activeTab === "leads" && "Manage service inquiries and waterproofing leads."}
            </p>
          </div>
          
          {/* --- STORE OPEN/CLOSED TOGGLE --- */}
          <button 
            onClick={toggleStoreStatus} 
            className={`hidden sm:flex ml-4 px-4 py-2 rounded-xl text-sm font-black shadow-sm items-center gap-2 transition-all cursor-pointer border ${
              isStoreOpen 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Store className="w-4 h-4" />
            {isStoreOpen ? 'STORE IS OPEN' : 'STORE IS CLOSED'}
          </button>

        </div>
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-xl shrink-0 gap-1">
          <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Live Orders</button>
          <button onClick={() => setActiveTab("inventory")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "inventory" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Inventory</button>
          <button onClick={() => setActiveTab("leads")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "leads" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Service Leads</button>
        </div>
      </div>

      {/* ======================= */}
      {/* TAB 1: LIVE ORDERS UI   */}
      {/* ======================= */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 font-bold">Loading Store Dashboard...</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-5 font-bold">Order Details</th>
                    <th className="p-5 font-bold">Customer</th>
                    <th className="p-5 font-bold">Amount</th>
                    <th className="p-5 font-bold">Current Status</th>
                    <th className="p-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-bold">No orders found.</td></tr>
                  ) : (
                    orders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      const StatusIcon = statusConfig.icon;
                      const isExpanded = expandedOrderId === order.id;
                      const address = order.delivery_address || {};

                      return (
                        <React.Fragment key={order.id}>
                          <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? "bg-slate-50" : ""}`}>
                            <td className="p-5">
                              <div className="font-black text-slate-900 text-base">#{order.id.split("-")[0].toUpperCase()}</div>
                              <div className="text-xs text-slate-500 mt-1 font-medium">{new Date(order.created_at).toLocaleString('en-IN')}</div>
                              {order.profiles && (
                                <div className="mt-2 inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-100">
                                  <Truck className="w-3 h-3" /> Assigned to: {order.profiles.full_name || 'Partner'}
                                </div>
                              )}
                            </td>
                            <td className="p-5">
                              <div className="font-bold text-slate-800">{address.fullName || "Unknown Customer"}</div>
                              <div className="text-xs text-slate-500 mt-1">{order.items?.length || 0} Items</div>
                            </td>
                            <td className="p-5 font-black text-emerald-700 text-base">₹{order.total_amount}</td>
                            <td className="p-5">
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg w-fit ${statusConfig.bg} ${statusConfig.color} border border-white/20`}>
                                <StatusIcon className="w-4 h-4" />
                                <span className="text-xs font-bold tracking-wide">{statusConfig.label}</span>
                              </div>
                            </td>
                            <td className="p-5 text-right">
                              <button onClick={() => toggleExpand(order.id)} className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer">
                                {isExpanded ? "Close Details" : "View Full Order"}
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="p-0 border-b-4 border-slate-200">
                                <div className="bg-slate-50 p-6 flex flex-col lg:flex-row gap-6 shadow-inner">
                                  
                                  <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-rose-500" /> Delivery Details</h3>
                                    <div className="space-y-3 text-sm">
                                      <div className="flex gap-3 text-slate-600">
                                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="font-bold text-slate-900">{address.fullName || "N/A"}</span>
                                      </div>
                                      <div className="flex gap-3 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <a href={`tel:${address.phone}`} className="text-blue-600 hover:underline font-bold">{address.phone || "N/A"}</a>
                                      </div>
                                      <div className="flex gap-3 text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                        <div className="leading-relaxed">
                                          <span className="font-bold text-slate-800">{address.area}</span><br />
                                          {address.streetAddress}<br />
                                          {address.landmark && <span className="text-xs text-slate-500">Landmark: {address.landmark}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-500" /> Items to Fulfill</h3>
                                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                      {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <img src={item.image || "https://placehold.co/200"} alt="Product" className="w-12 h-12 rounded-lg bg-slate-100 object-cover shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <div className="font-bold text-xs text-slate-900 truncate">{item.productName}</div>
                                            <div className="text-[11px] text-slate-500 mt-1 flex gap-2"><span className="font-bold">{item.pack?.size}</span><span>Qty: {item.quantity}</span></div>
                                            {item.selectedShade && (
                                              <div className="mt-1 flex gap-1.5 bg-white w-fit px-1.5 py-0.5 rounded border">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.selectedShade.hex }} />
                                                <span className="text-[10px] font-black">{item.selectedShade.code}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex-1 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl text-white flex flex-col justify-center gap-6">
                                    <div>
                                      <h3 className="font-extrabold text-slate-100 mb-2 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-cyan-400" /> Assign Delivery Partner
                                      </h3>
                                      <p className="text-xs text-slate-400 mb-2">Select a driver for this order.</p>
                                      <select
                                        className="w-full bg-slate-800 border border-slate-700 text-cyan-400 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                                        value={order.delivery_partner_id || ""}
                                        onChange={(e) => assignDeliveryPartner(order.id, e.target.value)}
                                        disabled={updatingId === order.id}
                                      >
                                        <option value="">-- Unassigned --</option>
                                        {deliveryPartners.map((partner) => (
                                          <option key={partner.id} value={partner.id}>
                                            {partner.full_name || "Delivery Partner"} ({partner.phone || "No Phone"})
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <h3 className="font-extrabold text-slate-100 mb-2">Update Pipeline Status</h3>
                                      <select
                                        className="w-full bg-slate-800 border border-slate-700 text-white text-sm font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        disabled={updatingId === order.id}
                                      >
                                        {ORDER_STATUSES.map((status) => (
                                          <option key={status.id} value={status.id}>{status.label}</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    {updatingId === order.id && <div className="text-xs font-bold text-emerald-400 animate-pulse text-center">Saving to Database...</div>}
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================= */}
      {/* TAB 2: INVENTORY UI     */}
      {/* ======================= */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search products by name or brand..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={handleCreateProduct}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Product Name & Brand</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Base Price</th>
                    <th className="p-4 font-bold text-center">Visibility</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingProducts ? (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-bold">Loading Inventory...</td></tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-bold">No products found.</td></tr>
                  ) : (
                    filteredInventory.map(product => {
                      let packsList = [];
                      if (typeof product.packs === 'string') {
                          try { packsList = JSON.parse(product.packs); } catch(e) {}
                      } else {
                          packsList = product.packs || [];
                      }

                      return (
                        <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${!product.is_active && 'opacity-60 grayscale'}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={product.image || "https://placehold.co/200"} alt="" className="w-10 h-10 rounded-lg border border-slate-200 object-cover bg-white" />
                              <div>
                                <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wide font-black">{product.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 font-medium text-xs">{product.category}</td>
                          <td className="p-4 font-black text-slate-900">
                            {packsList && packsList.length > 0 ? `₹${packsList[0].price}` : 'N/A'}
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${product.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
                            >
                              {product.is_active ? 'In Stock (Live)' : 'Hidden (Out of Stock)'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= */}
      {/* TAB 3: LEADS UI         */}
      {/* ======================= */}
      {activeTab === "leads" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" /> Customer Inquiries
            </h2>
          </div>
          {loadingLeads ? (
            <div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 font-bold">Loading Quotes...</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-5 font-bold">Date</th>
                    <th className="p-5 font-bold">Customer Details</th>
                    <th className="p-5 font-bold">Assigned Painter</th>
                    <th className="p-5 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {!leads || leads.length === 0 ? (
                    <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-bold">No customer quotes found.</td></tr>
                  ) : (
                    leads.map((lead: PaintingLead) => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5 text-xs text-slate-500 font-medium">
                          {lead.preferred_date}
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-slate-900">{lead.full_name}</div>
                          <div className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</div>
                          <div className="text-xs text-slate-500 mt-1">{lead.address}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{lead.service_type} - {lead.property_type}</div>
                        </td>
                        <td className="p-5">
                          {lead.assigned_contractor ? (
                            <div className="text-sm">
                              <div className="font-bold text-emerald-700">{lead.assigned_contractor.split("-")[0]}</div>
                              <div className="text-xs text-slate-500">{lead.assigned_contractor.split("-")[1]}</div>
                            </div>
                          ) : (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const name = (form.elements.namedItem('cName') as HTMLInputElement).value;
                                const phone = (form.elements.namedItem('cPhone') as HTMLInputElement).value;
                                handleAssignContractor(lead.id, name, phone);
                              }}
                              className="flex flex-col gap-2"
                            >
                              <input required name="cName" type="text" placeholder="Painter Name" className="p-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500" />
                              <input required name="cPhone" type="text" placeholder="Painter Phone" className="p-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500" />
                              <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-[10px] rounded hover:bg-indigo-700 transition">Assign</button>
                            </form>
                          )}
                        </td>
                        <td className="p-5 text-center">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold w-24 inline-block text-center ${
                            lead.assigned_contractor ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {lead.assigned_contractor ? 'Assigned' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================= */}
      {/* EDIT PRODUCT MODAL      */}
      {/* ======================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Tags className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-none">{editingProduct.id.startsWith('NK-PROD-') ? 'Add New Product' : 'Edit Product'}</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">ID: {editingProduct.id}</p>
                </div>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              <form id="product-form" onSubmit={handleSaveProduct} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                    <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                    <select required value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 bg-slate-50">
                      <option value="Asian Paints">Asian Paints</option>
                      <option value="Berger Paints">Berger Paints</option>
                      <option value="Birla Opus">Birla Opus</option>
                      <option value="Hardware & Tools">Hardware & Tools</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select required value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 bg-slate-50">
                      <option value="Interior Emulsion">Interior Emulsion</option>
                      <option value="Exterior Emulsion">Exterior Emulsion</option>
                      <option value="Waterproofing">Waterproofing</option>
                      <option value="Primers & Putty">Primers & Putty</option>
                      <option value="Wood & Metal Enamel">Wood & Metal Enamel</option>
                      <option value="Brushes & Tools">Brushes & Tools</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Finish Type</label>
                    <select value={editingProduct.finish} onChange={e => setEditingProduct({...editingProduct, finish: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 bg-slate-50">
                      <option value="Matt">Matt</option>
                      <option value="Sheen">Sheen</option>
                      <option value="Soft Sheen">Soft Sheen</option>
                      <option value="High Gloss">High Gloss</option>
                      <option value="Rough Texture">Rough Texture</option>
                    </select>
                  </div>

                  {/* --- NEW HSN CODE FIELD --- */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">HSN/SAC Code</label>
                    <input type="text" value={editingProduct.hsn_code || ''} onChange={e => setEditingProduct({...editingProduct, hsn_code: e.target.value})} placeholder="e.g. 3208" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 bg-slate-50" />
                  </div>
                  {/* --------------------------- */}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tagline / Short Description</label>
                    <input type="text" value={editingProduct.tagline} onChange={e => setEditingProduct({...editingProduct, tagline: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 bg-slate-50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                    <input type="url" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 bg-slate-50" />
                  </div>
                  
                  <div className="sm:col-span-2 flex items-center gap-6 mt-2 bg-slate-100 p-3 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingProduct.requiresShade} onChange={e => setEditingProduct({...editingProduct, requiresShade: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded cursor-pointer" />
                      <span className="text-sm font-bold text-slate-700">Requires Tinting/Shade Selection</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingProduct.is_active} onChange={e => setEditingProduct({...editingProduct, is_active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded cursor-pointer" />
                      <span className="text-sm font-bold text-slate-700">Live on Store</span>
                    </label>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Pack Sizes & Pricing</h4>
                      <p className="text-[10px] text-slate-500">Configure prices for containers.</p>
                    </div>
                    <button type="button" onClick={addPack} className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer">
                      <Plus className="w-3 h-3" /> Add Variant
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {editingProduct.packs?.map((pack: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Pack Label</label>
                            <input type="text" value={pack.size} onChange={e => updatePack(index, 'size', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800" required />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Volume (L/Kg)</label>
                            <input type="number" value={pack.volumeLiters} onChange={e => updatePack(index, 'volumeLiters', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800" required />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-emerald-600 uppercase">Selling Price (₹)</label>
                            <input type="number" value={pack.price} onChange={e => updatePack(index, 'price', Number(e.target.value))} className="w-full p-2 border border-emerald-200 bg-emerald-50 rounded-lg text-xs font-black text-emerald-900" required />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-rose-500 uppercase">MRP (Strike)</label>
                            <input type="number" value={pack.originalPrice} onChange={e => updatePack(index, 'originalPrice', Number(e.target.value))} className="w-full p-2 border border-rose-200 bg-rose-50 rounded-lg text-xs font-bold text-rose-900" required />
                          </div>
                        </div>
                        <button type="button" onClick={() => removePack(index)} className="p-2 mt-4 text-slate-400 hover:text-white hover:bg-rose-500 rounded-lg border border-slate-200 hover:border-rose-500 transition-colors shadow-sm cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!editingProduct.packs || editingProduct.packs.length === 0) && (
                      <div className="text-sm font-bold text-rose-500 bg-rose-50 border border-rose-200 p-4 rounded-xl text-center flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" /> You must add at least one pack variant!
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setEditingProduct(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button form="product-form" type="submit" disabled={savingProduct || !editingProduct.packs?.length} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                {savingProduct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}