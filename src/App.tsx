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
  LoyaltyProfile,
  PaintingProject,
  PushAlert,
  PaintBrand,
  PaintCategory,
} from "./types";
import {
  PRODUCTS_CATALOG,
  DEFAULT_LOYALTY,
  INITIAL_ORDERS,
  INITIAL_PROJECTS,
  PUSH_ALERTS_INITIAL,
  JAMSHEDPUR_AREAS,
} from "./data/paintDatabase";
import { Header } from "./components/Header";
import { BrandSelector } from "./components/BrandSelector";
import { ProductCard } from "./components/ProductCard";
import { ShadePickerModal } from "./components/ShadePickerModal";
import { CartDrawer } from "./components/CartDrawer";
import { PaymentModal } from "./components/PaymentModal";
import { LiveOrderTracking } from "./components/LiveOrderTracking";
import { PaintConsultantChat } from "./components/PaintConsultantChat";
import { LoyaltyRewards } from "./components/LoyaltyRewards";
import { OrderHistory } from "./components/OrderHistory";
import { ProjectDashboard } from "./components/ProjectDashboard";
import { NotificationCenter } from "./components/NotificationCenter";
import DeliveryDashboard from "./components/DeliveryDashboard"; // <-- ADDED
import {
  Zap,
  Palette,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  Settings,
} from "lucide-react";

const ADMIN_EMAIL = "singhrajputn197@gmail.com";

export default function App() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [activeTab, setActiveTab] = useState<
    | "store"
    | "projects"
    | "history"
    | "loyalty"
    | "chat"
    | "notifications"
    | "services"
    | "admin"
    | "delivery"
  >("store");

  const [selectedBrand, setSelectedBrand] = useState<PaintBrand | "All">("All");
  const [selectedCategory, setSelectedCategory] = useState<
    PaintCategory | "All"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentArea, setCurrentArea] = useState("Mango");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [loyalty, setLoyalty] = useState<LoyaltyProfile>(DEFAULT_LOYALTY);
  const [projects, setProjects] = useState<PaintingProject[]>(INITIAL_PROJECTS);
  const [alerts, setAlerts] = useState<PushAlert[]>(PUSH_ALERTS_INITIAL);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<OrderRecord | null>(null);

  // NEW: Global shade state for "Color First" workflow
  const [globalSelectedShade, setGlobalSelectedShade] =
    useState<ShadeItem | null>(null);

  const [shadeModalConfig, setShadeModalConfig] = useState<{
    isOpen: boolean;
    product?: ProductItem;
    currentShade?: ShadeItem;
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
      if (selectedBrand !== "All" && product.brand !== selectedBrand)
        return false;
      if (selectedCategory !== "All" && product.category !== selectedCategory)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesTagline = product.tagline.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesDefaultShade = product.defaultShadeCode
          ?.toLowerCase()
          .includes(q);

        if (
          !matchesName &&
          !matchesBrand &&
          !matchesTagline &&
          !matchesCategory &&
          !matchesDefaultShade
        ) {
          return false;
        }
      }
      return true;
    });
  }, [dbProducts, selectedBrand, selectedCategory, searchQuery]);

  const handleAddToCart = (
    product: ProductItem,
    pack: PackOption,
    shade?: ShadeItem,
  ) => {
    const cartItemId = `${product.id}-${pack.size}-${shade ? shade.code : "default"}`;
    // Grab the exact tinting cost calculated in the modal
    const tintingCost = shade ? (shade as any).calculatedTintingCharge || 0 : 0;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
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

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item,
        ),
      );
    }
  };

  const handleClearCart = () => setCartItems([]);

  const handleOpenShadePicker = (
    product?: ProductItem,
    currentShade?: ShadeItem,
  ) => {
    setShadeModalConfig({
      isOpen: true,
      product: product, // if undefined, it acts as "Color First" search
      currentShade: currentShade || globalSelectedShade || undefined,
    });
  };

  const handleSelectShadeFromModal = (shade: ShadeItem) => {
    if (shadeModalConfig.product) {
      // PRODUCT FIRST: Add directly to cart
      handleAddToCart(
        shadeModalConfig.product,
        shadeModalConfig.product.packs.find(
          // FIX: Compare against volumeLiters (number), not size (string)
          (p) => p.volumeLiters === (shade as any).selectedPackSize, 
        ) || shadeModalConfig.product.packs[0],
        shade,
      );
    } else {
      // COLOR FIRST: Save globally, close modal, and let user pick a product
      setGlobalSelectedShade(shade);
      setActiveTab("store");
      // Optional auto-filter
      if (
        shade.brand === "Asian Paints" ||
        shade.brand === "Berger Paints" ||
        shade.brand === "Birla Opus"
      ) {
        setSelectedBrand(shade.brand as PaintBrand);
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

    const earnedCoins = Math.floor(newOrder.total / 10);
    setLoyalty((prev) => ({
      ...prev,
      rangCoins: prev.rangCoins + earnedCoins - newOrder.loyaltyDiscount * 2,
      lifetimeCoinsEarned: prev.lifetimeCoinsEarned + earnedCoins,
    }));

    setTrackingOrder(newOrder);
  };

  const handleReorder = (order: OrderRecord) => {
    setCartItems(order.items);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {showFlashBanner && (
        <div className="bg-slate-950 text-amber-300 px-4 py-2 text-xs flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2 max-w-5xl mx-auto overflow-hidden">
            <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-xs text-[10px] uppercase">
              ⚡ Moon City Hub
            </span>
            <span className="font-extrabold text-white truncate">
              Nikhil Paints Jamshedpur: Computerized Dispensing for 7,000+ Shade
              Codes with 35-Min Express Delivery!
            </span>
            <span className="hidden md:inline text-slate-400">
              Asian Paints • Berger • Birla Opus
            </span>
          </div>
          <button
            onClick={() => setShowFlashBanner(false)}
            className="text-slate-400 hover:text-white text-xs px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <Header
        activeTab={
          activeTab === "notifications" || activeTab === "admin"
            ? "store"
            : activeTab
        }
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
        loyalty={loyalty}
        notifications={alerts}
        onOpenNotifications={() => setActiveTab("notifications")}
        onOpenConsultantChat={() => setIsChatOpen(true)}
      />

      {isAdmin && (
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-center gap-4 shadow-md z-30">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Store Owner Mode
          </span>
          <button
            onClick={() =>
              setActiveTab(activeTab === "admin" ? "store" : "admin")
            }
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            {activeTab === "admin" ? "Exit Dashboard" : "Open Admin Dashboard"}
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5">
        {activeTab === "admin" && isAdmin && <AdminDashboard />}
        {activeTab === "delivery" && <DeliveryDashboard />}
        {activeTab === "store" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/20 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md tracking-wider">
                    ⚡ Same-Day Delivery across Jamshedpur
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    Mango • Dimna • Sakchi • Bistupur
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Nikhil Paints & Hardware Jamshedpur
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Authorized Asian Paints, Berger & Birla Opus Dealer • Moon
                  City near Jaipur Marble, Dimna Mango Road, Jamshedpur - 831012
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {/* Trigger Color-First Workflow */}
                  <button
                    onClick={() => handleOpenShadePicker()}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Browse 7,000+ Shades</span>
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-white/15"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Ask Paint & Waterproofing AI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COLOR FIRST WORKFLOW BANNER */}
            {globalSelectedShade && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border-4 border-white shadow-md"
                    style={{ backgroundColor: globalSelectedShade.hex }}
                  />
                  <div>
                    <h3 className="text-sm font-black text-indigo-950">
                      Showing paints compatible with {globalSelectedShade.name}{" "}
                      ({globalSelectedShade.code})
                    </h3>
                    <p className="text-xs text-indigo-700 font-medium mt-0.5">
                      Select a product below to choose your pack size and add to
                      cart.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGlobalSelectedShade(null)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 cursor-pointer shadow-sm transition-all"
                >
                  Clear Shade Filter
                </button>
              </div>
            )}

            <BrandSelector
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {selectedBrand === "All"
                    ? "All Paints & Hardware"
                    : selectedBrand}
                </h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                  {filteredProducts.length} Products Available
                </span>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Clear search "{searchQuery}"
                </button>
              )}
            </div>

            {isLoadingProducts ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-bold text-slate-500">
                  Loading your real-time inventory from Supabase...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base text-slate-800">
                  No matching paints found
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartItems={cartItems}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onOpenShadePicker={(prod) =>
                      handleOpenShadePicker(
                        prod,
                        globalSelectedShade || undefined,
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <OrderHistory
            orders={orders}
            onReorder={handleReorder}
            onTrackOrder={setTrackingOrder}
          />
        )}

        {activeTab === "projects" && (
          <ProjectDashboard
            projects={projects}
            onCreateProject={(newProj) =>
              setProjects((prev) => [newProj, ...prev])
            }
            onQuickOrderPaint={(product, shade) =>
              handleAddToCart(product, product.packs[0], shade)
            }
          />
        )}

        {activeTab === "loyalty" && <LoyaltyRewards loyalty={loyalty} />}
        {activeTab === "notifications" && (
          <NotificationCenter alerts={alerts} />
        )}

        {activeTab === "services" && (
          <div className="space-y-6 max-w-5xl mx-auto py-2">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Professional Painting Services
              </h2>
            </div>
            {/* Service Cards removed for brevity, assuming they are standard */}
          </div>
        )}
      </main>

      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white p-3.5 sm:px-5 sm:py-3 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border-2 border-white/40"
      >
        <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
        <span className="font-black text-xs uppercase tracking-wider hidden sm:inline">
          Chat with Paint Expert
        </span>
      </button>

      <ShadePickerModal
        isOpen={shadeModalConfig.isOpen}
        onClose={() => setShadeModalConfig({ isOpen: false })}
        onSelectShade={handleSelectShadeFromModal}
        product={shadeModalConfig.product}
        currentSelectedShade={shadeModalConfig.currentShade}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        currentArea={currentArea}
        loyalty={loyalty}
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
    </div>
  );
}
