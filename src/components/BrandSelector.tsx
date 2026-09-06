import React from 'react';
import { PaintBrand, PaintCategory } from '../types';
import { BRANDS_INFO } from '../data/paintDatabase';
import { Sparkles, Layers, ShieldCheck, Paintbrush, Hammer, CheckCircle2 } from 'lucide-react';

interface BrandSelectorProps {
  selectedBrand: PaintBrand | 'All';
  onSelectBrand: (brand: PaintBrand | 'All') => void;
  selectedCategory: PaintCategory | 'All';
  onSelectCategory: (category: PaintCategory | 'All') => void;
}

const CATEGORIES: { id: PaintCategory | 'All'; label: string; icon: any }[] = [
  { id: 'All', label: 'All Products', icon: Layers },
  { id: 'Interior Emulsion', label: 'Interior Luxury', icon: Sparkles },
  { id: 'Exterior Emulsion', label: 'Exterior Weatherproof', icon: ShieldCheck },
  { id: 'Waterproofing', label: 'Waterproofing & Damp Proof', icon: ShieldCheck },
  { id: 'Primers & Putty', label: 'Wall Putty & Primers', icon: Paintbrush },
  { id: 'Wood & Metal Enamel', label: 'Wood & Metal Enamel', icon: Paintbrush },
  { id: 'Brushes & Tools', label: 'Rollers, Brushes & Tools', icon: Hammer }
];

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  selectedBrand,
  onSelectBrand,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Brand Cards Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Official Authorized Brands (Instant Computerized Tinting)
          </h2>
          <button
            onClick={() => onSelectBrand('All')}
            className={`text-xs font-bold transition-colors cursor-pointer ${
              selectedBrand === 'All' ? 'text-rose-600 underline' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Show All Brands
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {BRANDS_INFO.map(brand => {
            const isSelected = selectedBrand === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => onSelectBrand(brand.id as PaintBrand)}
                className={`relative p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                  isSelected
                    ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
                id={`brand-card-${brand.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <div 
                  className="absolute top-0 right-0 w-16 h-16 rounded-full -mr-6 -mt-6 opacity-20 pointer-events-none"
                  style={{ backgroundColor: brand.accentColor }}
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span 
                      className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-md uppercase"
                      style={{ backgroundColor: brand.bgLight, color: brand.accentColor }}
                    >
                      {brand.logoText}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-slate-900" />
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {brand.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {brand.tagline}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>⚡ {brand.deliveryTime}</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-sm">
                    In Stock
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
              id={`category-pill-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
