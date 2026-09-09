import React, { useState } from "react";
import { 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ShoppingCart, 
  Zap, 
  Palette 
} from "lucide-react";
import { ProductItem, PackOption, ShadeItem } from "../types";

interface ProductDetailPageProps {
  product: ProductItem;
  onBack: () => void;
  onAddToCart: (product: ProductItem, pack: PackOption, shade?: ShadeItem) => void;
  onOpenShadePicker: (product: ProductItem) => void;
  onBuyNow: (product: ProductItem, pack: PackOption, shade?: ShadeItem) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onOpenShadePicker,
  onBuyNow,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Parse packs safely
  let packsList = product.packs;
  if (typeof packsList === 'string') {
    try { packsList = JSON.parse(packsList); } catch (e) { packsList = []; }
  }
  const [selectedPack, setSelectedPack] = useState<PackOption>(packsList?.[0] || { size: '1 Litre', volumeLiters: 1, price: 500, originalPrice: 600 });
  
  const [selectedShade, setSelectedShade] = useState<ShadeItem | null>(null);

  // Parse gallery images safely
  let imagesList = (product as any).galleryImages || (product as any).gallery_images;
  if (typeof imagesList === 'string') {
    try { imagesList = JSON.parse(imagesList); } catch (e) { imagesList = []; }
  }
  if (!imagesList || imagesList.length === 0) {
    imagesList = [product.image || "https://placehold.co/600"];
  }

  const currentPrice = selectedPack?.price || 500;
  const currentMrp = selectedPack?.originalPrice || currentPrice + 100;
  const discountPercent = currentMrp > currentPrice 
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-6 px-3 sm:px-6 animate-in fade-in duration-300">
      
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4 sticky top-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm relative overflow-hidden flex items-center justify-center h-[380px] sm:h-[480px]">
            <img 
              src={imagesList[selectedImageIndex] || "https://placehold.co/600"} 
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
            <span className="absolute top-4 left-4 bg-slate-900/80 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-xs">
              {product.brand}
            </span>
          </div>

          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((imgUrl: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-2xl border-2 bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden transition-all cursor-pointer ${selectedImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-xs">
              <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-[10px] font-black text-slate-800">35-Min Express</div>
              <div className="text-[9px] text-slate-400">Jamshedpur Hub</div>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-[10px] font-black text-slate-800">100% Genuine</div>
              <div className="text-[9px] text-slate-400">Direct Factory Stock</div>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-xs">
              <RotateCcw className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <div className="text-[10px] font-black text-slate-800">Tint Guarantee</div>
              <div className="text-[9px] text-slate-400">Exact Shade Match</div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Buy Box */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <div className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-1">
                {product.category} • {product.finish || 'Matt'} Finish
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                  {product.tagline}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-white" /> {product.rating || 4.5}
              </div>
              <span className="text-xs font-bold text-slate-400">({product.reviewsCount || 128} verified reviews)</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">₹{currentPrice}</span>
              {currentMrp > currentPrice && (
                <>
                  <span className="text-base font-bold text-slate-400 line-through">₹{currentMrp}</span>
                  <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2 py-0.5 rounded-md">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
              <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase">Inclusive of all taxes</span>
            </div>

            {packsList && packsList.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Pack Size: <span className="text-indigo-600 font-black">{selectedPack?.size}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {packsList.map((pack: PackOption, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPack(pack)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${selectedPack?.size === pack.size ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className="text-xs font-black">{pack.size}</span>
                      <span className="text-[11px] font-bold text-emerald-700">₹{pack.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.requiresShade && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Shade & Tinting</label>
                  <button 
                    onClick={() => onOpenShadePicker(product)}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Browse 7,000+ Shades →
                  </button>
                </div>
                
                <div 
                  onClick={() => onOpenShadePicker(product)}
                  className="bg-indigo-50/50 border border-indigo-200 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0" 
                      style={{ backgroundColor: selectedShade?.hex || '#F8FAFC' }} 
                    />
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {selectedShade ? `${selectedShade.name} (${selectedShade.code})` : "Select Computerized Tint Shade"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {selectedShade ? `${selectedShade.brand}` : "Click to pick from Asian Paints, Berger & Birla Opus"}
                      </div>
                    </div>
                  </div>
                  <Palette className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <button 
                onClick={() => selectedPack && onAddToCart(product, selectedPack, selectedShade || undefined)}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button 
                onClick={() => selectedPack && onBuyNow(product, selectedPack, selectedShade || undefined)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};