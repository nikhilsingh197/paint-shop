import React, { useState } from "react";
import { ProductItem, PackOption, CartItem, ShadeItem } from "../types";
import { ShoppingBag, Palette, Plus, Minus } from "lucide-react";

interface ProductCardProps {
  product: ProductItem;
  cartItems: CartItem[];
  currentShade?: ShadeItem; // <-- Added to track the active global shade
  onAddToCart: (product: ProductItem, pack: PackOption, shade?: ShadeItem) => void; // <-- Updated to accept shade
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onOpenShadePicker: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartItems,
  currentShade, // <-- Extracted from props
  onAddToCart,
  onUpdateQuantity,
  onOpenShadePicker,
}) => {
  // Default to the first available pack size
  const [selectedPack, setSelectedPack] = useState<PackOption>(
    product.packs[0],
  );

  // Check if this exact product & pack size & shade is already in the cart
  const cartItemId = `${product.id}-${selectedPack.size}-${currentShade ? currentShade.code : "default"}`;
  const existingCartItem = cartItems.find((item) => item.id === cartItemId);

  // Fallback Image Logic
  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80";
  const imageSrc =
    product.image && product.image.startsWith("http")
      ? product.image
      : FALLBACK_IMAGE;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Product Image Section */}
      <div className="relative h-48 bg-slate-50 overflow-hidden shrink-0">
        <img
          src={imageSrc}
          alt={product.name || "Paint Product"}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
            e.currentTarget.onerror = null;
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
            {product.brand}
          </span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {product.category}
          </div>
          <h3 className="font-extrabold text-slate-900 text-base leading-tight mb-1.5 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {product.tagline}
          </p>
        </div>

        {/* Pack Size Selector */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
            Select Size
          </label>
          <div className="flex flex-wrap gap-2">
            {product.packs.map((pack) => (
              <button
                key={pack.size}
                onClick={() => setSelectedPack(pack)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  selectedPack.size === pack.size
                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {pack.size}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-end justify-between gap-2 mt-auto">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Price
            </div>
            <div className="text-xl font-black text-emerald-600 tracking-tight">
              ₹{selectedPack.price}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pick Shade Button (Always available for paints) */}
            {product.category.toLowerCase().includes("paint") ||
            product.category.toLowerCase().includes("enamel") ||
            product.category.toLowerCase().includes("emulsion") ? (
              <button
                onClick={() => onOpenShadePicker(product)}
                className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-colors"
                title="Choose Custom Shade"
              >
                <Palette className="w-5 h-5" />
              </button>
            ) : null}

            {/* Add to Cart / Quantity Adjuster */}
            {existingCartItem ? (
              <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl p-1 h-10">
                <button
                  onClick={() =>
                    onUpdateQuantity(
                      existingCartItem.id,
                      existingCartItem.quantity - 1,
                    )
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold w-4 text-center">
                  {existingCartItem.quantity}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(
                      existingCartItem.id,
                      existingCartItem.quantity + 1,
                    )
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                // <-- Updated to pass the currentShade into the cart
                onClick={() => onAddToCart(product, selectedPack, currentShade)}
                className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};