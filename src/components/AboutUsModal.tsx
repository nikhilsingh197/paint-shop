import React from "react";
import { ArrowLeft, Building2, PaintBucket, Truck, Heart } from "lucide-react";

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutUsModal({ isOpen, onClose }: AboutUsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-50 overflow-y-auto animate-in slide-in-from-right-full duration-300">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-slate-100 shadow-sm">
        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <h1 className="text-lg font-black text-slate-900">About Us</h1>
      </div>

      <div className="px-4 py-8 max-w-lg mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-6 rotate-3 hover:rotate-6 transition-transform">
            <PaintBucket className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nikhil Paints</h2>
          <p className="text-sm font-bold text-slate-500 mt-2">Coloring dreams since 2017</p>
        </div>

        {/* Story Timeline */}
        <div className="relative border-l-2 border-emerald-100 ml-4 pl-6 pb-4 space-y-10">
          
          <div className="relative">
            <div className="absolute -left-[35px] top-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-slate-50">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Established 2017</h3>
            <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">Our Roots in Mango</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              We started our journey with a humble brick-and-mortar hardware store in Mango, Jamshedpur. Our mission was simple: provide the best quality paints and hardware tools with honest advice to our local community.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[35px] top-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border-4 border-slate-50">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Present Day</h3>
            <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">Lightning Fast Delivery</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Today, we've evolved into a seamless online delivery platform serving the entirety of Jamshedpur. We bring premium paints, construction chemicals, and hardware from several top-tier brands right to your doorstep—in record time!
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[35px] top-0 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center border-4 border-slate-50">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">Our Promise</h3>
            <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">Quality & Trust</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              While we've expanded our reach and embraced technology, our core values remain unchanged. We still treat every order with the same care and dedication as our very first customer back in 2017.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
