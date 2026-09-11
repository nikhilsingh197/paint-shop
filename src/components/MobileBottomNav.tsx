import React from "react";
import {
  PaintBucket,
  ShieldCheck,
  Award,
  RotateCcw,
  Sparkles
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: "store" | "projects" | "history" | "loyalty" | "chat" | "services" | "admin" | "delivery") => void;
  onOpenConsultantChat: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenConsultantChat,
}) => {
  const navItems = [
    { id: "store", label: "Store", icon: PaintBucket },
    { id: "services", label: "Services", icon: ShieldCheck },
    { id: "history", label: "Orders", icon: RotateCcw },
    { id: "loyalty", label: "Rewards", icon: Award },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-2 flex justify-between items-center z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as any)}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-colors cursor-pointer ${
              isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className={`p-1.5 rounded-xl ${isActive ? "bg-emerald-50" : ""}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] mt-1 font-bold ${isActive ? "text-emerald-700" : "text-slate-500"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
      
      <button
        onClick={onOpenConsultantChat}
        className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-rose-500 hover:bg-slate-50"
      >
        <div className="p-1.5 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-1 font-bold text-slate-500">
          Chat
        </span>
      </button>
    </div>
  );
};
