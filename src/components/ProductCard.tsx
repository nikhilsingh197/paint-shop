import React, { useState } from "react";
import { ProductItem, PackOption, CartItem, ShadeItem } from "../types";
import { Palette, Plus, Minus, Zap } from "lucide-react";

interface ProductCardProps {
  product: ProductItem;
  cartItems: CartItem[];
  currentShade?: ShadeItem;
  onAddToCart: (product: ProductItem, pack: PackOption, shade?: ShadeItem) => void;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onOpenShadePicker: (product: ProductItem) => void;
  onProductClick?: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartItems,
  currentShade,
  onAddToCart,
  onUpdateQuantity,
  onOpenShadePicker,
  onProductClick
}) => {
  const [selectedPack, setSelectedPack] = useState<PackOption>(product.packs[0]);

  // Unique ID for the cart based on product, size, and chosen shade
  const cartItemId = `${product.id}-${selectedPack.size}-${currentShade ? currentShade.code : "default"}`;
  const existingCartItem = cartItems.find((item) => item.id === cartItemId);

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80";
  const imageSrc = product.image && product.image.startsWith("http") ? product.image : FALLBACK_IMAGE;

  // Determine if this is a tintable product
  const isTintable = product.category.toLowerCase().includes("paint") ||
                     product.category.toLowerCase().includes("enamel") ||
                     product.category.toLowerCase().includes("emulsion");

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col relative h-full">
      
      {/* Clickable Area for Product Details */}
      <div 
        className="cursor-pointer" 
        onClick={() => onProductClick && onProductClick(product)}
      >
        {/* Top Image Section - Q-Commerce Style (Compact) */}
        <div className="relative h-[140px] bg-slate-50 flex items-center justify-center p-3 shrink-0">
          <img
            src={imageSrc}
            alt={product.name}
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
          />
          
          {/* Brand & Delivery Promise Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              {product.brand}
            </span>
          </div>

          {product.in_stock === false && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg rotate-[-10deg]">
                Sold Out
              </span>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end z-20">
            {selectedPack.originalPrice > selectedPack.price && (
              <span className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                {Math.round(((selectedPack.originalPrice - selectedPack.price) / selectedPack.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          
          <div className="absolute bottom-2 left-2">
            <span className="bg-white/90 backdrop-blur-md border border-slate-100 text-slate-800 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> 35 MINS
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 pb-1 flex flex-col flex-1">
          {/* Title & Category */}
          <div className="mb-2 flex-1">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5 truncate">
              {product.category}
            </div>
            <h3 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">
              {product.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 flex flex-col">
        {/* Compact Pack Size Selector */}
        <div className="mb-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {product.packs.map((pack) => (
              <button
                key={pack.size}
                onClick={() => setSelectedPack(pack)}
                className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded border transition-colors ${
                  selectedPack.size === pack.size
                    ? "bg-slate-100 border-slate-300 text-slate-900"
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                }`}
              >
                {pack.size}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Price, Shade Picker, and Q-Commerce Add Button */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          
          {/* Price & Shade Group */}
          <div className="flex items-center gap-2 min-w-0">
            <div>
              <div className="text-xs font-black text-slate-900 leading-none">
                ₹{selectedPack.price}
              </div>
              {selectedPack.originalPrice && selectedPack.originalPrice > selectedPack.price && (
                <div className="text-[9px] text-slate-400 line-through mt-0.5">
                  ₹{selectedPack.originalPrice}
                </div>
              )}
            </div>

            {/* Tint/Shade Picker Button - Highly visible next to price */}
            {isTintable && (
              <button
                onClick={() => onOpenShadePicker(product)}
                className="w-7 h-7 shrink-0 rounded-full bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"
                title="Choose Color Shade"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add / Quantity Button - The Blinkit Signature Element */}
          <div className="shrink-0">
            {product.in_stock === false ? (
              <div className="h-8 px-3 bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-bold rounded-lg flex items-center justify-center uppercase tracking-wide cursor-not-allowed">
                Out of Stock
              </div>
            ) : existingCartItem ? (
              <div className="flex items-center bg-emerald-600 text-white rounded-lg shadow-sm h-8 w-20">
                <button
                  onClick={() => onUpdateQuantity(existingCartItem.id, existingCartItem.quantity - 1)}
                  className="flex-1 h-full flex items-center justify-center hover:bg-white/20 rounded-l-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold leading-none">
                  {existingCartItem.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(existingCartItem.id, existingCartItem.quantity + 1)}
                  className="flex-1 h-full flex items-center justify-center hover:bg-white/20 rounded-r-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product, selectedPack, currentShade)}
                className="h-8 w-20 bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs font-bold rounded-lg transition-colors uppercase tracking-wide active:scale-95 shadow-sm"
              >
                Add
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};