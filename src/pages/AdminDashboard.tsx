import { useState, useEffect } from "react";
import PageShell from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Users, ShoppingCart, Skull, Wallet, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Stats {
  totalVolume: number;
  activeDisputes: number;
  totalVendors: number;
  totalOrders: number;
  totalCommissions: number;
  heldEscrow: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalVolume: 0, activeDisputes: 0, totalVendors: 0, totalOrders: 0, totalCommissions: 0, heldEscrow: 0 });
  const [weekData, setWeekData] = useState<{ name: string; ltc: number }[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [panicConfirm, setPanicConfirm] = useState(false);
  const [autoWithdraw, setAutoWithdraw] = useState<any>(null);
  const [coldWallet, setColdWallet] = useState("");
  const [minAmount, setMinAmount] = useState("1.0");

  useEffect(() => {
    const fetchAll = async () => {
      const [ordersRes, disputesRes, vendorsRes, escrowRes, withdrawRes] = await Promise.all([
        supabase.from("orders").select("amount, created_at"),
        supabase.from("disputes").select("id, status"),
        supabase.from("user_roles").select("id").eq("role", "vendor"),
        supabase.from("escrow_pool").select("*").eq("status", "held"),
        supabase.from("admin_auto_withdraw").select("*").limit(1),
      ]);

      const orders = ordersRes.data || [];
      const disputes = disputesRes.data || [];
      const vendors = vendorsRes.data || [];
      const held = escrowRes.data || [];

      setEscrows(held);
      if (withdrawRes.data?.[0]) setAutoWithdraw(withdrawRes.data[0]);

      const totalVolume = orders.reduce((s, o) => s + Number(o.amount), 0);
      const totalCommissions = held.reduce((s, e) => s + Number(e.commission), 0);
      const heldEscrow = held.reduce((s, e) => s + Number(e.amount), 0);

      setStats({
        totalVolume: Math.round(totalVolume * 100) / 100,
        activeDisputes: disputes.filter((d) => d.status === "open" || d.status === "escalated").length,
        totalVendors: vendors.length,
        totalOrders: orders.length,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        heldEscrow: Math.round(heldEscrow * 100) / 100,
      });

      const weekLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
      const grouped = weekLabels.map((name) => ({ name, ltc: 0 }));
      orders.forEach((o) => {
        const day = new Date(o.created_at).getDay();
        const idx = day === 0 ? 6 : day - 1;
        grouped[idx].ltc += Number(o.amount);
      });
      setWeekData(grouped);
    };
    fetchAll();
  }, []);

  const releaseEscrow = async (escrowId: string) => {
    const { data } = await supabase.rpc("release_escrow" as any, { _escrow_id: escrowId });
    if (data && (data as any).success) {
      toast.success("Escrow serbest bırakıldı!");
      setEscrows((prev) => prev.filter((e) => e.id !== escrowId));
    } else {
      toast.error((data as any)?.error || "Hata");
    }
  };

  const executePanic = async () => {
    const { data } = await supabase.rpc("panic_destroy" as any);
    if (data && (data as any).success) {
      toast.success("🔥 Tüm hassas veriler imha edildi!");
      setPanicConfirm(false);
    } else {
      toast.error((data as any)?.error || "Hata");
    }
  };

  const saveAutoWithdraw = async () => {
    if (!user || !coldWallet) return;
    if (autoWithdraw) {
      await (supabase.from("admin_auto_withdraw") as any).update({
        cold_wallet: coldWallet,
        min_amount: parseFloat(minAmount),
        enabled: true,
      }).eq("id", autoWithdraw.id);
    } else {
      await (supabase.from("admin_auto_withdraw") as any).insert({
        admin_id: user.id,
        cold_wallet: coldWallet,
        min_amount: parseFloat(minAmount),
        frequency: "weekly",
        enabled: true,
      });
    }
    toast.success("Otomatik çekim yapılandırıldı!");
  };

  const statCards = [
    { label: "Toplam Hacim", value: `${stats.totalVolume} LTC`, icon: TrendingUp, color: "text-foreground" },
    { label: "Komisyon Geliri", value: `${stats.totalCommissions} LTC`, icon: Wallet, color: "text-green-500" },
    { label: "Escrow Havuzu", value: `${stats.heldEscrow} LTC`, icon: Shield, color: "text-yellow-500" },
    { label: "Aktif Dispute", value: stats.activeDisputes, icon: AlertTriangle, color: "text-primary" },
    { label: "Satıcı Sayısı", value: stats.totalVendors, icon: Users, color: "text-foreground" },
    { label: "Toplam Sipariş", value: stats.totalOrders, icon: ShoppingCart, color: "text-foreground" },
  ];

  return (
    <PageShell>
      <h1 className="text-xl font-mono font-bold text-primary neon-text mb-6">The Overseer — Command Center</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground font-mono">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card rounded-lg p-4 mb-6">
        <h2 className="text-sm font-mono text-muted-foreground mb-4">Haftalık İşlem Hacmi (LTC)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekData}>
            <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 10 }} />
            <YAxis tick={{ fill: "#888", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#d9d9d9", fontFamily: "JetBrains Mono", fontSize: 11 }} />
            <Bar dataKey="ltc" fill="hsl(349, 100%, 50%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Escrow Management */}
        <div className="glass-card rounded-lg p-4">
          <h2 className="text-sm font-mono font-bold text-foreground mb-3">Escrow Havuzu</h2>
          {escrows.length === 0 ? (
            <div className="text-xs text-muted-foreground font-mono text-center py-4">Bekleyen escrow yok.</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {escrows.map((e) => (
                <div key={e.id} className="flex items-center justify-between bg-secondary rounded p-2.5">
                  <div>
                    <div className="text-xs font-mono text-foreground">{Number(e.amount).toFixed(2)} LTC</div>
                    <div className="text-[10px] text-muted-foreground font-mono">Komisyon: {Number(e.commission).toFixed(2)}</div>
                  </div>
                  <button onClick={() => releaseEscrow(e.id)} className="px-2 py-1 bg-green-600/20 text-green-500 text-[10px] font-mono rounded hover:bg-green-600/30">
                    Serbest Bırak
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-Withdraw */}
        <div className="glass-card rounded-lg p-4">
          <h2 className="text-sm font-mono font-bold text-foreground mb-3">Otomatik Çekim (Cold Wallet)</h2>
          <div className="space-y-2">
            <input
              value={coldWallet}
              onChange={(e) => setColdWallet(e.target.value)}
              placeholder="Soğuk cüzdan adresi (Exodus)"
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2">
              <input
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Min miktar"
                type="number"
                step="0.1"
                className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={saveAutoWithdraw} className="px-3 py-2 bg-primary text-primary-foreground text-[10px] font-mono rounded neon-glow-btn">
                Kaydet
              </button>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">Haftalık • Min: {minAmount} LTC</div>
          </div>
        </div>
      </div>

      {/* PANIC BUTTON */}
      <div className="glass-card rounded-lg p-4 border border-destructive/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skull className="w-6 h-6 text-destructive" />
            <div>
              <div className="text-sm font-mono font-bold text-destructive">PANIC BUTTON — Self Destruct</div>
              <div className="text-[10px] text-muted-foreground font-mono">Tüm logları, IP kayıtlarını, mesajları ve hassas verileri kalıcı olarak sil</div>
            </div>
          </div>
          {!panicConfirm ? (
            <button onClick={() => setPanicConfirm(true)} className="px-4 py-2 bg-destructive/20 text-destructive text-xs font-mono rounded hover:bg-destructive/30 transition-colors">
              <Zap className="w-3 h-3 inline mr-1" /> AKTİFLEŞTİR
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-destructive font-mono animate-pulse">EMİN MİSİN?</span>
              <button onClick={executePanic} className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-mono rounded font-bold animate-pulse">
                🔥 İMHA ET
              </button>
              <button onClick={() => setPanicConfirm(false)} className="px-3 py-1.5 bg-secondary text-muted-foreground text-xs font-mono rounded">
                İptal
              </button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
