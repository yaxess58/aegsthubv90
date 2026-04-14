import { useAuth } from "@/lib/authContext";
import { useCustomization } from "@/lib/customizationContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, ShoppingCart, Store, Wallet, FileWarning, ScrollText, LogOut, ArrowRightLeft, User, Package, Lock, Coins, MessageSquare, Palette } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/security-logs", label: "Security Logs", icon: ScrollText },
  { to: "/admin/disputes", label: "Disputes", icon: FileWarning },
  { to: "/transactions", label: "İşlemler", icon: ArrowRightLeft },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/security", label: "Güvenlik", icon: Lock },
  { to: "/customization", label: "Özelleştir", icon: Palette },
];

const vendorLinks = [
  { to: "/vendor", label: "Ürünlerim", icon: Store },
  { to: "/vendor/wallet", label: "Cüzdan", icon: Wallet },
  { to: "/vendor/bond", label: "Depozito", icon: Coins },
  { to: "/transactions", label: "İşlemler", icon: ArrowRightLeft },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/security", label: "Güvenlik", icon: Lock },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/customization", label: "Özelleştir", icon: Palette },
];

const buyerLinks = [
  { to: "/market", label: "Market", icon: ShoppingCart },
  { to: "/orders", label: "Siparişlerim", icon: Package },
  { to: "/transactions", label: "İşlemler", icon: ArrowRightLeft },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/security", label: "Güvenlik", icon: Lock },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/customization", label: "Özelleştir", icon: Palette },
];

export default function AppSidebar() {
  const { role, user, logout } = useAuth();
  const { settings } = useCustomization();
  const navigate = useNavigate();
  const location = useLocation();

  const links = role === "admin" ? adminLinks : role === "vendor" ? vendorLinks : buyerLinks;
  const collapsed = settings.sidebarCollapsed;
  const isRight = settings.sidebarPosition === "right";
  const width = collapsed ? "w-16" : "w-56";
  const posClass = isRight ? "right-0" : "left-0";

  return (
    <aside className={`fixed ${posClass} top-0 h-screen ${width} bg-card border-${isRight ? "l" : "r"} border-border flex flex-col z-50 transition-all duration-300`}>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary shrink-0" />
        {!collapsed && <span className="font-mono text-sm font-bold text-primary neon-text">aeigsthub</span>}
        <div className={`${collapsed ? "" : "ml-auto"} flex items-center gap-2`}>
          <NotificationBell />
          {!collapsed && <span className="text-[8px] font-mono text-muted-foreground">v3.0</span>}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              title={collapsed ? link.label : undefined}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                active ? "bg-primary/10 text-primary neon-border" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {!collapsed && link.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-mono text-primary">
              {(user?.email?.[0] || "?").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground font-mono truncate">{user?.email}</div>
              <div className="text-[10px] font-mono text-primary">{role?.toUpperCase()}</div>
            </div>
          </div>
        )}
        <button
          onClick={async () => { await logout(); navigate("/"); }}
          title={collapsed ? "Çıkış" : undefined}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-destructive hover:bg-destructive/10 transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Çıkış"}
        </button>
      </div>
    </aside>
  );
}
