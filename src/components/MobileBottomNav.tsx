import React from "react";
import {
  PaintBucket,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Bell
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: "store" | "projects" | "history" | "chat" | "notifications" | "services" | "admin" | "delivery" | "legal") => void;
  onOpenConsultantChat: () => void;
  isChatOpen?: boolean;
  unreadNotificationsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenConsultantChat,
  isChatOpen = false,
  unreadNotificationsCount = 0,
}) => {
  const navItems = [
    { id: "store", label: "Store", icon: PaintBucket },
    { id: "services", label: "Services", icon: ShieldCheck },
    { id: "history", label: "Orders", icon: RotateCcw },
    { id: "notifications", label: "Alerts", icon: Bell, badge: unreadNotificationsCount },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex justify-between items-center z-50 shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.08)] pb-safe"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id && !isChatOpen;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id as any)}
            className={`flex-1 relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              isActive ? "text-emerald-700" : "text-slate-400 hover:text-slate-700 active:scale-95"
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? "bg-emerald-50 text-emerald-700" : ""}`}>
              <Icon className="w-5 h-5" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
            </div>
            <span className={`text-[10px] mt-0.5 font-bold tracking-tight ${isActive ? "text-emerald-800 font-black" : "text-slate-500"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
      
      {/* AI Paint Consultant Chat Button */}
      <button
        type="button"
        onClick={onOpenConsultantChat}
        className={`flex-1 relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
          isChatOpen ? "text-emerald-700" : "text-slate-400 hover:text-emerald-600 active:scale-95"
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${isChatOpen ? "bg-emerald-50 text-emerald-700" : ""}`}>
          <Sparkles className="w-5 h-5" />
        </div>
        <span className={`text-[10px] mt-0.5 font-bold tracking-tight ${isChatOpen ? "text-emerald-800 font-black" : "text-slate-500"}`}>
          AI Chat
        </span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
