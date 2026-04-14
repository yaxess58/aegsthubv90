import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { Wallet, Clock, CheckCircle, Percent } from "lucide-react";
import { toast } from "sonner";

interface WalletData {
  pending: number;
  available: number;
  commission: number;
  total: number;
}

export default function VendorWalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData>({ pending: 0, available: 0, commission: 0, total: 0 });
  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("vendor_wallets").select("*").eq("vendor_id", user.id).single();
      if (data) setWallet({ pending: Number(data.pending), available: Number(data.available), commission: Number(data.commission), total: Number(data.total) });
    };
    fetch();
  }, [user]);

  const handleWithdraw = () => {
    if (!withdrawAddr || !withdrawAmount) return;
    toast.success(`${withdrawAmount} LTC çekim talebi oluşturuldu.`);
    setWithdrawAddr("");
    setWithdrawAmount("");
  };

  const items = [
    { label: "Bekleyen Bakiye", value: wallet.pending, icon: Clock, color: "text-yellow-500" },
    { label: "Çekilebilir Bakiye", value: wallet.available, icon: CheckCircle, color: "text-green-500" },
    { label: "Komisyon Kesintisi (%10)", value: wallet.commission, icon: Percent, color: "text-primary" },
    { label: "Toplam Kazanç", value: wallet.total, icon: Wallet, color: "text-foreground" },
  ];

  return (
    <PageShell>
      <h1 className="text-xl font-mono font-bold text-primary neon-text mb-6">Cüzdan</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {items.map((item) => (
          <div key={item.label} className="glass-card rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-mono">{item.label}</span>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className={`text-3xl font-mono font-bold ${item.color}`}>{item.value.toFixed(2)} <span className="text-sm">LTC</span></div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-lg p-4">
        <h2 className="text-sm font-mono text-muted-foreground mb-3">Çekim Talebi</h2>
        <div className="flex gap-3">
          <input value={withdrawAddr} onChange={(e) => setWithdrawAddr(e.target.value)} placeholder="LTC Cüzdan Adresi" className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Miktar" type="number" step="0.01" className="w-32 bg-secondary border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={handleWithdraw} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-mono rounded font-bold neon-glow-btn">Çek</button>
        </div>
      </div>
    </PageShell>
  );
}
