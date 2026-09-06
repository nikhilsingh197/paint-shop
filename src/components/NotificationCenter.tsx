import React, { useState } from 'react';
import { PushAlert } from '../types';
import { 
  Bell, 
  Sparkles, 
  Zap, 
  Tag, 
  Clock, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  X
} from 'lucide-react';

interface NotificationCenterProps {
  alerts: PushAlert[];
  onApplyCoupon?: (code: string) => void;
  onDismissAlert?: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  alerts,
  onApplyCoupon,
  onDismissAlert
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    setCopiedCode(code);
    if (onApplyCoupon) onApplyCoupon(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto py-2">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              Push Notifications & Live Discount Alerts
            </h2>
            <p className="text-xs text-slate-500">
              Live deals on Asian Paints, Birla Opus, and waterproofing for Jamshedpur customers.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-950 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
          {alerts.length} Active Deals
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map(alert => (
          <div 
            key={alert.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative ${
              alert.type === 'flash_deal'
                ? 'bg-amber-50/70 border-amber-200'
                : alert.type === 'monsoon_offer'
                ? 'bg-sky-50/70 border-sky-200'
                : 'bg-white border-slate-200'
            }`}
          >
            {/* Top row with badge and time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {alert.type === 'flash_deal' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Flash Deal
                  </span>
                )}
                {alert.type === 'monsoon_offer' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-600 text-white flex items-center gap-1">
                    ⛈️ Monsoon Special
                  </span>
                )}
                {alert.type === 'shade_launch' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-600 text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> New Shades
                  </span>
                )}
              </div>

              <span className="text-[10px] text-slate-400 font-medium">
                {alert.timestamp}
              </span>
            </div>

            {/* Title & Body */}
            <div>
              <h4 className="font-black text-sm text-slate-900">
                {alert.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {alert.message}
              </p>
            </div>

            {/* Coupon and Apply Action */}
            {alert.discountCode && (
              <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {alert.discountCode}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(alert.discountCode!)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode === alert.discountCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied & Applied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Coupon</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
