import React, { useState, useMemo, useEffect } from "react";
import { fetchProducts } from "./lib/productApi";
import AdminDashboard from "./components/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import {
  ProductItem,
  PackOption,
  ShadeItem,
  CartItem,
  OrderRecord,
  PaintingProject,
  PushAlert,
  PaintBrand,
  PaintCategory,
} from "./types";
import {
  PRODUCTS_CATALOG,
  INITIAL_ORDERS,
  INITIAL_PROJECTS,
  PUSH_ALERTS_INITIAL,
  JAMSHEDPUR_AREAS,
} from "./data/paintDatabase";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { BrandSelector } from "./components/BrandSelector";
import { ProductCard } from "./components/ProductCard";
import { ShadePickerModal } from "./components/ShadePickerModal";
import { CartDrawer } from "./components/CartDrawer";
import { PaymentModal } from "./components/PaymentModal";
import { LiveOrderTracking } from "./components/LiveOrderTracking";
import { PaintConsultantChat } from "./components/PaintConsultantChat";
import { OrderHistory } from "./components/OrderHistory";
import { PaintingServices } from "./components/PaintingServices";
import { NotificationCenter } from "./components/NotificationCenter";
import DeliveryDashboard from "./components/DeliveryDashboard";
import { getDeliveryTime } from "./utils/delivery";
import { ProductDetailPage } from "./components/ProductDetailPage"; 
import {
  Zap,
  Palette,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  Settings,
  ShoppingBag,
  MapPin,
  PhoneCall
} from "lucide-react";

const ADMIN_EMAIL = "singhrajputn197@gmail.com";

export default function App() {
  const { user, profile } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const isDelivery = profile?.role === "delivery";

  const [activeTab, setActiveTab] = useState<
    | "store"
    | "projects"
    | "history"
    | "chat"
    | "notifications"
    | "services"
    | "admin"
    | "delivery"
  >("store");

  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<PaintBrand | "All">("All");
  const [selectedCategory, setSelectedCategory] = useState<PaintCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentArea, setCurrentArea] = useState("Mango");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [projects, setProjects] = useState<PaintingProject[]>(INITIAL_PROJECTS);
  const [alerts, setAlerts] = useState<PushAlert[]>(PUSH_ALERTS_INITIAL);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<OrderRecord | null>(null);

  const [globalSelectedShade, setGlobalSelectedShade] = useState<ShadeItem | null>(null);

  const [shadeModalConfig, setShadeModalConfig] = useState<{
    isOpen: boolean;
    product?: ProductItem;
    currentShade?: ShadeItem;
    isDirectAddToCart?: boolean;
  }>({
    isOpen: false,
  });

  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    orderData?: any;
  }>({
    isOpen: false,
  });

  const [showFlashBanner, setShowFlashBanner] = useState(true);
  const [dbProducts, setDbProducts] = useState<ProductItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // --- FLOATING CART CALCULATIONS ---
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.pack.price + item.tintingCharge) * item.quantity, 0);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const products = await fetchProducts();
        if (!cancelled) {
          setDbProducts(products.length > 0 ? products : PRODUCTS_CATALOG);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        if (!cancelled) setDbProducts(PRODUCTS_CATALOG);
      } finally {
        if (!cancelled) setIsLoadingProducts(false);
      }
    }
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return dbProducts.filter((product) => {
      if (selectedBrand !== "All" && product.brand !== selectedBrand) return false;
      if (selectedCategory !== "All" && product.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesTagline = product.tagline.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesDefaultShade = product.defaultShadeCode?.toLowerCase().includes(q);

        if (!matchesName && !matchesBrand && !matchesTagline && !matchesCategory && !matchesDefaultShade) {
          return false;
        }
      }
      return true;
    });
  }, [dbProducts, selectedBrand, selectedCategory, searchQuery]);

  const handleAddToCart = (product: ProductItem, pack: PackOption, shade?: ShadeItem) => {
    const cartItemId = `${product.id}-${pack.size}-${shade ? shade.code : "default"}`;
    const baseTintCharge = shade ? (shade.tinting_charge || 0) : 0;
    const tintingCost = baseTintCharge * pack.volumeLiters;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          image: product.image,
          pack: pack,
          selectedShade: shade,
          quantity: 1,
          tintingCharge: tintingCost,
        },
      ];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } else {
      setCartItems((prev) => prev.map((item) => item.id === cartItemId ? { ...item, quantity: newQty } : item));
    }
  };

  const handleClearCart = () => setCartItems([]);

  const handleOpenShadePicker = (product?: ProductItem, currentShade?: ShadeItem, isDirectAddToCart?: boolean) => {
    setShadeModalConfig({
      isOpen: true,
      product: product, 
      currentShade: currentShade || globalSelectedShade || undefined,
      isDirectAddToCart: isDirectAddToCart,
    });
  };

  const handleSelectShadeFromModal = (shade: ShadeItem) => {
    if (shadeModalConfig.product && shadeModalConfig.isDirectAddToCart) {
      // Picked from Catalog ProductCard -> Add to cart immediately
      handleAddToCart(
        shadeModalConfig.product,
        shadeModalConfig.product.packs.find((p) => p.volumeLiters === (shade as any).selectedPackSize) || shadeModalConfig.product.packs[0],
        shade,
      );
    } else {
      // Picked from ProductDetailPage OR Global Banner -> Set the shade
      setGlobalSelectedShade(shade);
      if (!activeProduct) {
        setActiveTab("store");
        if (shade.brand === "Asian Paints" || shade.brand === "Berger Paints" || shade.brand === "Birla Opus") {
          setSelectedBrand(shade.brand as PaintBrand);
        }
      }
    }
    setShadeModalConfig({ isOpen: false });
  };
  
  const handleProceedToPayment = (orderData: any) => {
    setIsCartOpen(false);
    setPaymentModalData({ isOpen: true, orderData: orderData });
  };

  const handlePaymentSuccess = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setPaymentModalData({ isOpen: false });
    setTrackingOrder(newOrder);
  };

  const handleReorder = (order: OrderRecord) => {
    setCartItems(order.items);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f8f6] text-slate-950 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      <style>{`
        @keyframes np-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -7px, 0); }
        }
        @keyframes np-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.15); }
          50% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
        }
        @keyframes np-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes np-sheen {
          0% { transform: translateX(-110%) rotate(18deg); }
          100% { transform: translateX(180%) rotate(18deg); }
        }
        .np-float { animation: np-float 4.5s ease-in-out infinite; }
        .np-pulse { animation: np-pulse 2.4s ease-out infinite; }
        .np-shimmer { position: relative; overflow: hidden; }
        .np-shimmer::after {
          content: "";
          position: absolute;
          inset: 0 auto 0 -35%;
          width: 28%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.42), transparent);
          transform: skewX(-18deg);
          animation: np-shimmer 3.8s ease-in-out infinite;
          pointer-events: none;
        }
        .np-sheen { position: relative; overflow: hidden; }
        .np-sheen::after {
          content: "";
          position: absolute;
          top: -30%;
          bottom: -30%;
          left: -20%;
          width: 18%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          transform: translateX(-110%) rotate(18deg);
          animation: np-sheen 4.2s ease-in-out infinite;
          pointer-events: none;
        }
        .np-glass {
          background: rgba(255,255,255,.76);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .np-hide-scroll::-webkit-scrollbar { display: none; }
        .np-hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "chat") setIsChatOpen(true);
          else setActiveTab(tab);
        }}
        isAdmin={isAdmin}
        isDelivery={isDelivery}
        onOpenConsultantChat={() => setIsChatOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative overflow-x-hidden">
      {showFlashBanner && (
        <div className="sticky top-0 z-[60] bg-[#10251d] text-white border-b border-emerald-400/10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="shrink-0 rounded-full bg-emerald-400 text-emerald-950 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em]">
                ⚡ Express
              </div>
              <p className="truncate text-[10px] sm:text-xs font-semibold text-emerald-50/95">
                {getDeliveryTime(currentArea)} delivery across Jamshedpur • 7,000+ shade codes
              </p>
            </div>
            <button
              onClick={() => setShowFlashBanner(false)}
              className="shrink-0 h-7 w-7 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close announcement"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="sticky top-[41px] sm:top-[42px] z-50">
        <Header
          activeTab={activeTab === "notifications" || activeTab === "admin" ? "store" : activeTab}
          onTabChange={(tab) => {
            if (tab === "chat") setIsChatOpen(true);
            else setActiveTab(tab);
          }}
          currentArea={currentArea}
          onAreaChange={setCurrentArea}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartItems={cartItems}
          onOpenCart={() => setIsCartOpen(true)}
          notifications={alerts}
          onOpenNotifications={() => setActiveTab("notifications")}
          onOpenConsultantChat={() => setIsChatOpen(true)}
        />
      </div>



      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-32">
        {activeTab === "admin" && isAdmin && (
          <AdminDashboard 
            projects={projects}
            onUpdateProject={(id, name, phone) => {
              setProjects(prev => prev.map(p => p.id === id ? { ...p, contractorName: name, contractorPhone: phone } : p))
            }}
          />
        )}
        {activeTab === "delivery" && <DeliveryDashboard />}

        {activeTab === "store" && (
          <div className="space-y-5 sm:space-y-7">
            {activeProduct ? (
              <ProductDetailPage 
                product={activeProduct}
                currentArea={currentArea}
                onBack={() => setActiveProduct(null)}
                onAddToCart={handleAddToCart}
                onOpenShadePicker={(prod) => handleOpenShadePicker(prod, globalSelectedShade || undefined)}
                onBuyNow={(product, pack, shade) => {
                  handleAddToCart(product, pack, shade);
                  setIsCartOpen(true);
                }}
                currentShade={globalSelectedShade || undefined}
              />
            ) : (
              <>
                {/* Premium Q-commerce hero */}
                <section className="relative overflow-hidden rounded-[28px] bg-[#17362b] text-white shadow-[0_18px_60px_-24px_rgba(20,83,45,.45)]">
              <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-2xl" />
              <div className="absolute right-10 bottom-0 h-36 w-36 rounded-full bg-lime-300/10 blur-2xl" />
              <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-amber-300/10 blur-2xl" />
              <div className="relative z-10 grid lg:grid-cols-[1.2fr_.8fr] gap-6 items-center p-5 sm:p-8 lg:p-10 np-sheen">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100 backdrop-blur">
                    <Zap className="w-3.5 h-3.5 text-emerald-300" />
                    Fast paint delivery
                  </div>

                  <h1 className="mt-4 text-[30px] leading-[1.02] sm:text-5xl font-black tracking-[-0.045em]">
                    Fresh walls.
                    <br />
                    <span className="text-emerald-300">Zero waiting.</span>
                  </h1>

                  <p className="mt-3 max-w-md text-sm sm:text-base leading-relaxed text-white/70">
                    Premium paints, waterproofing and hardware delivered to your doorstep with expert shade matching.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleOpenShadePicker()}
                      className="np-pulse rounded-2xl bg-emerald-400 text-emerald-950 px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] shadow-lg hover:bg-emerald-300 transition active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Palette className="w-4 h-4" />
                      Explore 7,000+ shades
                    </button>
                    <button
                      onClick={() => setActiveTab("services")}
                      className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
                    >
                      Book a pro
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-white/55">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Authentic brands
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Computerized tinting
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Secure payments
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex justify-end">
                  <div className="relative w-64 h-64 lg:w-72 lg:h-72 np-float">
                    <div className="absolute inset-7 rounded-[34px] rotate-6 bg-white/5 border border-white/10" />
                    <div className="absolute inset-9 rounded-[30px] -rotate-6 bg-gradient-to-br from-emerald-300/20 to-white/5 border border-white/10 backdrop-blur-md" />
                    <div className="absolute inset-14 rounded-[26px] rotate-3 bg-[#f7f8f6] shadow-2xl overflow-hidden">
                      <div className="h-full bg-[linear-gradient(135deg,#eff8f2_0%,#d8f1df_48%,#fffaf0_48%,#fffaf0_100%)] p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black text-emerald-900 shadow">NP SELECT</span>
                          <span className="text-[9px] font-black text-emerald-900">2.8L</span>
                        </div>
                        <div>
                          <div className="h-16 w-16 rounded-2xl bg-white/70 border border-white flex items-center justify-center shadow-lg">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-200" />
                          </div>
                          <div className="mt-3 text-[14px] font-black text-emerald-950">Premium Finish</div>
                          <div className="text-[9px] font-semibold text-emerald-900/60">Delivered in under {getDeliveryTime(currentArea)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {globalSelectedShade && (
              <section className="np-glass rounded-3xl border border-emerald-100 shadow-sm p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl border-4 border-white shadow shrink-0"
                    style={{ backgroundColor: globalSelectedShade.hex }}
                  />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">Selected shade</p>
                    <h3 className="truncate text-sm font-black text-slate-900">{globalSelectedShade.name}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">{globalSelectedShade.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => setGlobalSelectedShade(null)}
                  className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  Clear
                </button>
              </section>
            )}

            {/* Quick utility rail */}
            <section className="grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { icon: Zap, label: getDeliveryTime(currentArea), sub: "Express" },
                { icon: Palette, label: "7,000+", sub: "Shades" },
                { icon: ShieldCheck, label: "100%", sub: "Genuine" },
                { icon: PhoneCall, label: "Free", sub: "Consult" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="group rounded-2xl bg-white border border-slate-100 p-3 sm:p-3.5 shadow-[0_8px_24px_-18px_rgba(15,23,42,.35)] hover:-translate-y-0.5 transition">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="mt-2 text-[10px] sm:text-xs font-black text-slate-900">{label}</div>
                  <div className="text-[8px] sm:text-[9px] font-semibold text-slate-400">{sub}</div>
                </div>
              ))}
            </section>

            <section className="bg-white rounded-[26px] border border-slate-100 shadow-[0_12px_35px_-25px_rgba(15,23,42,.35)] p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3 mb-3 px-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">Shop by finish</p>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">Pick your paint</h2>
                </div>
                <span className="text-[9px] font-bold text-slate-400">Fast-moving picks</span>
              </div>
              <div className="np-hide-scroll overflow-x-auto pb-1">
                <BrandSelector
                  selectedBrand={selectedBrand}
                  onSelectBrand={setSelectedBrand}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </section>

            {/* Product section */}
            <section>
              <div className="flex items-end justify-between gap-3 mb-3 px-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Curated for you</p>
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight">Best sellers 👌</h2>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-[10px] font-black text-emerald-700">{filteredProducts.length} products</div>
                  <div className="text-[9px] text-slate-400">Ready to order</div>
                </div>
              </div>

              {isLoadingProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-3xl bg-white border border-slate-100 p-3 shadow-sm">
                      <div className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
                      <div className="mt-3 h-3 rounded bg-slate-100 animate-pulse w-3/4" />
                      <div className="mt-2 h-3 rounded bg-slate-100 animate-pulse w-1/2" />
                      <div className="mt-4 h-10 rounded-2xl bg-slate-100 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="mt-4 font-black text-slate-700">No products found</h3>
                  <p className="mt-1 text-xs text-slate-400">Try another shade, brand or category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="transition duration-300 hover:-translate-y-1">
                      <ProductCard 
                        product={product} 
                        currentArea={currentArea}
                        onAddToCart={handleAddToCart}
                        cartItems={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onOpenShadePicker={(prod) => handleOpenShadePicker(prod, globalSelectedShade || undefined, true)}
                        onProductClick={setActiveProduct}
                        currentShade={globalSelectedShade || undefined}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
            </>
            )}
          </div>
        )}

        {activeTab === "history" && <OrderHistory orders={orders} onReorder={handleReorder} onTrackOrder={setTrackingOrder} />}
        {activeTab === "notifications" && <NotificationCenter alerts={alerts} />}
        {activeTab === "services" && (
          <PaintingServices isAdmin={isAdmin} />
        )}
      </main>

      <footer className="bg-[#10251d] text-white/60 pt-12 pb-36 px-4 sm:px-6 mt-auto border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <h3 className="text-xl leading-none tracking-tighter">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-200">Nikhil Paints</span><br/>
              <span className="text-[13px] font-extrabold text-white/50 uppercase tracking-widest">& Hardware</span>
            </h3>
            <p className="text-xs leading-relaxed font-medium max-w-sm">
              Jamshedpur&apos;s premium destination for paints, waterproofing and hardware. Authorized dealers for Asian Paints, Berger and Birla Opus, with computerized tinting for 7,000+ shades.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="tel:+917004734407" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-emerald-400 hover:text-emerald-950 flex items-center justify-center transition cursor-pointer">
                <PhoneCall className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-emerald-400 hover:text-emerald-950 flex items-center justify-center transition cursor-pointer">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-[0.16em]">Quick links</h4>
            <ul className="space-y-3 text-xs font-medium">
              <li><button onClick={() => setActiveTab("store")} className="hover:text-emerald-300 transition cursor-pointer">Shop paints & hardware</button></li>
              <li><button onClick={() => setActiveTab("services")} className="hover:text-emerald-300 transition cursor-pointer">Hire professional painters</button></li>
              <li><button onClick={() => setIsChatOpen(true)} className="hover:text-emerald-300 transition cursor-pointer">Free waterproofing consultation</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-[0.16em]">Visit the hub</h4>
            <ul className="space-y-3 text-xs font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 shrink-0 text-emerald-300 mt-0.5" />
                <span className="leading-relaxed">
                  Moon City, near Jaipur Marble,<br />
                  Dimna Mango Road,<br />
                  Jamshedpur, Jharkhand - 831012
                </span>
              </li>
              <li className="flex items-center gap-3 pt-2">
                <PhoneCall className="w-4 h-4 shrink-0 text-emerald-300" />
                <span className="text-white font-bold tracking-wide">+91 70047 34407</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-[10px] flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Nikhil Paints & Hardware. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 font-medium">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition cursor-pointer">Refund & Cancellation</span>
          </div>
        </div>
      </footer>

      {/* Floating cart — mobile-first Q-commerce CTA */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-20 md:bottom-4 left-0 right-0 z-[80] px-3 sm:px-4 pointer-events-none animate-in slide-in-from-bottom-5 duration-300">
          <div className="max-w-xl mx-auto pointer-events-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="np-shimmer w-full rounded-[22px] bg-emerald-600 text-white shadow-[0_20px_55px_-20px_rgba(5,150,105,.9)] p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer transition active:scale-[0.985]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-100">
                    {totalCartCount} {totalCartCount === 1 ? "item" : "items"}
                  </div>
                  <div className="text-base sm:text-lg font-black leading-none mt-1 truncate">
                    ₹{totalCartPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm bg-white text-emerald-700 px-4 py-3 rounded-2xl shrink-0">
                View cart
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating consultant CTA */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed right-4 z-[70] h-12 w-12 rounded-2xl bg-[#17362b] text-white shadow-[0_12px_32px_-12px_rgba(15,23,42,.7)] hover:scale-105 transition flex items-center justify-center cursor-pointer border border-white/10 ${totalCartCount > 0 ? "bottom-24" : "bottom-5"}`}
        aria-label="Open paint consultant"
      >
        <Sparkles className="w-5 h-5 text-emerald-300" />
      </button>

      <ShadePickerModal
        isOpen={shadeModalConfig.isOpen}
        onClose={() => setShadeModalConfig({ isOpen: false })}
        onSelectShade={handleSelectShadeFromModal}
        product={shadeModalConfig.product}
        currentSelectedShade={shadeModalConfig.currentShade}
        isDirectAddToCart={shadeModalConfig.isDirectAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        currentArea={currentArea}
        onProceedToPayment={handleProceedToPayment}
        onNavigateToOrders={() => setActiveTab("history")}
      />

      {paymentModalData.isOpen && paymentModalData.orderData && (
        <PaymentModal
          orderData={paymentModalData.orderData}
          onClose={() => setPaymentModalData({ isOpen: false })}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {trackingOrder && (
        <LiveOrderTracking
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onReorder={handleReorder}
        />
      )}

      <PaintConsultantChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onPickShadeFromChat={(shade) =>
          handleOpenShadePicker(
            dbProducts.length > 0 ? dbProducts[0] : PRODUCTS_CATALOG[0],
            shade,
          )
        }
      />

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "chat") setIsChatOpen(true);
          else setActiveTab(tab);
        }}
        onOpenConsultantChat={() => setIsChatOpen(true)}
      />
      </div>
    </div>
  );
}
