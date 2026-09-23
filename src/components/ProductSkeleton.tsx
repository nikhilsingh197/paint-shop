import React from "react";

export const ProductSkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col relative h-full animate-pulse">
      {/* Top Image Section Placeholder */}
      <div className="relative h-[140px] bg-slate-100 flex items-center justify-center p-3 shrink-0 overflow-hidden">
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[np-shimmer_1.6s_infinite]" />
        
        {/* Top left brand badge skeleton */}
        <div className="absolute top-2 left-2 h-4 w-14 bg-slate-200 rounded" />
        
        {/* Top right discount badge skeleton */}
        <div className="absolute top-2 right-2 h-4 w-10 bg-slate-200 rounded" />
        
        {/* Center image placeholder silhouette */}
        <div className="w-16 h-20 bg-slate-200/70 rounded-lg" />
        
        {/* Bottom delivery time badge */}
        <div className="absolute bottom-2 left-2 h-4 w-16 bg-white/80 rounded" />
      </div>

      {/* Content Section */}
      <div className="p-3 pb-1 flex flex-col flex-1">
        {/* Category skeleton */}
        <div className="h-2.5 w-16 bg-slate-200 rounded mb-2" />
        
        {/* Title skeleton (2 lines) */}
        <div className="h-3.5 w-5/6 bg-slate-200 rounded mb-1.5" />
        <div className="h-3.5 w-3/5 bg-slate-200 rounded" />
      </div>

      {/* Pack Size Selector Placeholder */}
      <div className="px-3 pb-3 flex flex-col mt-auto">
        <div className="flex gap-1.5 my-2.5">
          <div className="h-6 w-9 bg-slate-200 rounded" />
          <div className="h-6 w-9 bg-slate-100 rounded" />
          <div className="h-6 w-11 bg-slate-100 rounded" />
        </div>

        {/* Bottom Bar: Price + Add Button */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
          <div>
            <div className="h-4 w-12 bg-slate-200 rounded mb-1" />
            <div className="h-2.5 w-8 bg-slate-100 rounded" />
          </div>

          <div className="flex items-center gap-2">
            {/* Shade circle placeholder */}
            <div className="w-7 h-7 rounded-full bg-slate-200" />
            {/* Add button placeholder */}
            <div className="h-8 w-20 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductSkeletonGridProps {
  count?: number;
}

export const ProductSkeletonGrid: React.FC<ProductSkeletonGridProps> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeletonCard key={index} />
      ))}
    </div>
  );
};

export default ProductSkeletonGrid;
