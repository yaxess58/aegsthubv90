import { useAuth } from "@/lib/authContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, ShoppingCart, Store, Wallet, FileWarning, ScrollText, LogOut, ArrowRightLeft, User, Package, Lock, Coins, MessageSquare } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/security-logs", label: "Security Logs", icon: ScrollText },
  { to: "/admin/disputes", label: "Disputes", icon: FileWarning },
  { to: "/transactions", label: "Islemler", icon: ArrowRightLeft },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/security", label: "Guvenlik", icon: Lock },
];

const vendorLinks = [
  { to: "/vendor", label: "Urunlerim", icon: Store },
  { to: "/vendor/wallet", label: "Cuzdan", icon: Wallet },
  { to: "/vendor/bond", label: "Depozito", icon: Coins },
  { to: "/transactions", label: "Islemler", icon: ArrowRightLeft },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/security", label: "Guvenlik", icon: Lock },
  { to: "/profile", label: "Profil", icon: User },
];

const buyerLinks = [
  { to: "/market", label: "Market", icon: ShoppingCart },
  { to: "/orders", label: "Siparislerim", icon: Package },
  { to: "/transactions", label: "Islemler", icon: ArrowRightLeft },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/security", label: "Guvenlik", icon: Lock },
  { to: "/profile", label: "Profil", icon: User },
];

export default function AppSidebar() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = role === "admin" ? adminLinks : role === "vendor" ? vendorLinks : buyerLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-card border-r border-border flex flex-col z-50">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-mono text-sm font-bold text-primary neon-text">aeigsthub</span>
        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />
          <span className="text-[8px] font-mono text-muted-foreground">v3.0</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                active ? "bg-primary/10 text-primary neon-border" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-mono text-primary">
            {(user?.email?.[0] || "?").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground font-mono truncate">{user?.email}</div>
            <div className="text-[10px] font-mono text-primary">{role?.toUpperCase()}</div>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); navigate("/"); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Çıkış
        </button>
      </div>
    </aside>
  );
}
