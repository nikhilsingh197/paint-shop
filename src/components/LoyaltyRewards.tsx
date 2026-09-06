import React, { useState } from 'react';
import { LoyaltyProfile } from '../types';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Sparkles, 
  Gift, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Star,
  Users,
  Coins
} from 'lucide-react';

interface LoyaltyRewardsProps {
  loyalty: LoyaltyProfile;
  onRedeemPerk?: (perk: string) => void;
}

export const LoyaltyRewards: React.FC<LoyaltyRewardsProps> = ({
  loyalty,
  onRedeemPerk
}) => {
  const [isScratched, setIsScratched] = useState(false);
  const [scratchReward, setScratchReward] = useState<string | null>(null);

  const handleScratch = () => {
    if (isScratched) return;
    setIsScratched(true);
    setScratchReward('🎉 Flat ₹250 OFF on Asian Paints Royale or Birla Opus + 100 Rang Coins!');
    
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Banner & Wallet */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Tier & Balance (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md shadow-xs">
                {loyalty.tier} MEMBER
              </span>
              <span className="text-xs text-slate-300">
                Nikhil Paints & Hardware Club
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Nikhil Rang Club Rewards
            </h2>
            
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Earn 10 Rang Coins for every ₹100 spent on paint cans, brushes, and waterproofing in Jamshedpur. Redeem instantly at checkout!
            </p>

            {/* Progress to Next Tier */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1.5">
                <span>Progress to Platinum Master Contractor:</span>
                <span className="text-amber-400">{loyalty.nextTierProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${loyalty.nextTierProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Wallet Coin Box (5 cols) */}
          <div className="md:col-span-5 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <Coins className="w-6 h-6" />
            </div>

            <div className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">
              Available Rang Coins
            </div>

            <div className="text-3xl font-black text-amber-300">
              {loyalty.rangCoins}
            </div>

            <div className="text-xs font-bold text-slate-200">
              Worth <span className="text-white text-sm font-black">₹{(loyalty.rangCoins * 0.5).toFixed(0)}</span> in direct order discounts
            </div>

            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
              Lifetime Earned: {loyalty.lifetimeCoinsEarned} Coins • {loyalty.totalLitresPurchased}L Paint
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Daily Scratch Card Mini-Game */}
      <div className="p-5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
            🎁
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">
              Daily Master Painter Lucky Scratch Card
            </h3>
            <p className="text-xs text-slate-600">
              Tap to reveal special contractor discounts & bonus tinting tokens!
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          {!isScratched ? (
            <button
              onClick={handleScratch}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              Scratch Card Now ✨
            </button>
          ) : (
            <div className="p-3 bg-white border border-amber-300 rounded-xl shadow-sm text-xs font-black text-slate-900 animate-in zoom-in-95">
              {scratchReward}
            </div>
          )}
        </div>
      </div>

      {/* Unlocked Tier Privileges */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-base text-slate-900">
          Your Gold Pro Unlocked Privileges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {loyalty.unlockedPerks.map((perk, idx) => (
            <div 
              key={idx}
              className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800 leading-relaxed">
                {perk}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Painter & Contractor Referral Club */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Contractor & Painter Referral Program
            </h3>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            Earn 500 Coins / Referral
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Are you a local painting contractor or interior designer in Jamshedpur? Refer clients to purchase genuine Asian Paints, Berger, or Birla Opus materials from Nikhil Paints and earn instant cashback commissions & points on every liter!
        </p>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            readOnly
            value="NIKHIL-JAMSHEDPUR-PRO-8421"
            className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 flex-1 max-w-sm"
          />
          <button
            onClick={() => alert("Referral Code copied to clipboard: NIKHIL-JAMSHEDPUR-PRO-8421")}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Copy Referral Code
          </button>
        </div>
      </div>
    </div>
  );
};
