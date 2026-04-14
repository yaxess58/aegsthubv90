import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { QRCodeSVG } from "qrcode.react";
import { ShoppingCart, Clock, Loader2, CheckCircle, Key, Package, Truck, User, Lock, Timer, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import VendorRating from "@/components/VendorRating";
import DeliveryMethodSelector from "@/components/DeliveryMethodSelector";

type PaymentStatus = "idle" | "pending" | "processing" | "paid";
type DeliveryMethod = "cargo" | "dead_drop" | "mailbox";

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  vendor_id: string;
  stock: number;
  image_emoji: string | null;
  image_url: string | null;
  delivery_data: string | null;
  tracking_number: string | null;
  commission_rate: number | null;
  category: string | null;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [vendorName, setVendorName] = useState<string>("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [paymentData, setPaymentData] = useState<{ address: string; expires_at: string; qr_data: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("cargo");

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setProduct(data as ProductRow);
        const rate = data.commission_rate ?? (data.type === "physical" ? 15 : 10);
        setCommissionRate(rate);
        const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", data.vendor_id).single();
        if (profile) setVendorName(profile.display_name || "Anonim Satıcı");
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!paymentData) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(paymentData.expires_at).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (status === "pending") {
          toast.error("Ödeme süresi doldu!");
          setStatus("idle");
          setPaymentData(null);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentData, status]);

  // Prevent browser history leak during payment
  useEffect(() => {
    if (status !== "idle") {
      window.history.replaceState(null, "", "/market");
    }
  }, [status]);

  const startPayment = async () => {
    if (!product || !user) return;
    setStatus("pending");

    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      product_id: product.id,
      buyer_id: user.id,
      status: "pending",
      amount: product.price,
      delivery_method: product.type === "digital" ? "cargo" : deliveryMethod,
    }).select().single();

    if (orderErr) { toast.error("Sipariş oluşturulamadı"); setStatus("idle"); return; }

    const { data: addrData } = await supabase.rpc("generate_payment_address", {
      _order_id: order.id,
      _amount: product.price,
    });

    if (addrData) {
      const addr = addrData as any;
      setPaymentData({ address: addr.address, expires_at: addr.expires_at, qr_data: addr.qr_data });
    }

    setTimeout(() => setStatus("processing"), 6000);
    setTimeout(async () => {
      const { data: result } = await supabase.rpc("process_order_payment", {
        _order_id: order.id,
        _ltc_address: (addrData as any)?.address || "",
      });

      if (result && (result as any).error) {
        toast.error((result as any).error);
        setStatus("idle");
      } else {
        setStatus("paid");
        const r = result as any;
        toast.success(`Ödeme onaylandı! Komisyon: %${r?.commission_rate || commissionRate} (${r?.commission} LTC)`);
      }
    }, 10000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) return <PageShell><div className="text-muted-foreground font-mono animate-pulse">Yükleniyor...</div></PageShell>;
  if (!product) return <PageShell><div className="text-muted-foreground font-mono">Ürün bulunamadı.</div></PageShell>;

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        {/* Product Hero */}
        <div className="glass-card rounded-lg overflow-hidden mb-4">
          {product.image_url ? (
            <div className="aspect-video bg-secondary">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video bg-secondary flex items-center justify-center">
              <span className="text-7xl opacity-40">{product.image_emoji || "📦"}</span>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-lg font-bold text-foreground">{product.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-primary neon-text">{product.price} LTC</div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono mt-1 ${
                  product.type === "digital" ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"
                }`}>
                  {product.type === "digital" ? <Key className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                  {product.type.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <User className="w-3 h-3" /> {vendorName}
              </div>
              <VendorRating vendorId={product.vendor_id} size="md" />
              <div className="text-xs text-muted-foreground font-mono">Stok: {product.stock}</div>
              <div className="text-xs text-muted-foreground font-mono">Komisyon: %{commissionRate}</div>
              {product.category && <div className="text-[10px] font-mono px-2 py-0.5 bg-secondary rounded text-muted-foreground">{product.category}</div>}
            </div>
          </div>
        </div>

        {/* Anonymity Notice */}
        <div className="glass-card rounded-lg p-3 mb-4 flex items-center gap-3 border border-primary/20">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <div className="text-[11px] font-mono font-bold text-primary">Anonim İşlem</div>
            <div className="text-[9px] font-mono text-muted-foreground">Tek kullanımlık adres • Tarayıcı geçmişi koruması • Sipariş hash'leme</div>
          </div>
        </div>

        {/* Delivery Method Selection */}
        {status === "idle" && product.type === "physical" && (
          <div className="glass-card rounded-lg p-4 mb-4">
            <DeliveryMethodSelector value={deliveryMethod} onChange={setDeliveryMethod} productType={product.type} />
          </div>
        )}

        {status === "idle" && (
          <motion.button
            onClick={startPayment}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-lg font-mono font-bold neon-glow-btn text-sm"
          >
            <ShoppingCart className="w-4 h-4" /> SATIN AL — Escrow Başlat
          </motion.button>
        )}

        {status !== "idle" && (
          <div className="glass-card rounded-lg p-6 neon-border">
            <div className="flex items-center gap-6 mb-4">
              {(["pending", "processing", "paid"] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                    status === s ? "bg-primary text-primary-foreground animate-pulse" :
                    (["pending", "processing", "paid"].indexOf(status) > i ? "bg-green-600 text-white" : "bg-secondary text-muted-foreground")
                  }`}>
                    {["pending", "processing", "paid"].indexOf(status) > i ? <CheckCircle className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {s === "pending" ? "Beklemede" : s === "processing" ? "Onaylanıyor" : "Ödendi"}
                  </span>
                  {i < 2 && <div className="w-8 h-px bg-border" />}
                </div>
              ))}
            </div>

            {status === "pending" && paymentData && (
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 ${
                  timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  <Timer className="w-3 h-3" />
                  Kalan Süre: {formatTime(timeLeft)}
                  {timeLeft < 300 && <AlertTriangle className="w-3 h-3" />}
                </div>
                <p className="text-xs text-muted-foreground font-mono mb-3">
                  Bu adres sadece size özeldir. <span className="text-primary">{product.price} LTC</span> gönderin:
                </p>
                <div className="inline-block p-3 bg-secondary rounded-lg mb-3">
                  <QRCodeSVG value={paymentData.qr_data} size={160} bgColor="transparent" fgColor="#d9d9d9" />
                </div>
                <div className="bg-secondary rounded px-3 py-2 text-xs font-mono text-foreground break-all flex items-center gap-2">
                  <Lock className="w-3 h-3 text-primary flex-shrink-0" />
                  {paymentData.address}
                </div>
                <div className="flex items-center justify-center gap-1 mt-3 text-xs text-yellow-500 font-mono">
                  <Clock className="w-3 h-3" /> Ödeme bekleniyor...
                </div>
              </div>
            )}

            {status === "processing" && (
              <div className="text-center py-4">
                <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
                <p className="text-sm font-mono text-muted-foreground">Blockchain onayı bekleniyor...</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">Escrow havuzuna aktarılıyor</p>
              </div>
            )}

            {status === "paid" && (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-mono text-green-500 font-bold mb-2">Ödeme Onaylandı!</p>
                {product.type === "digital" ? (
                  <div className="bg-secondary rounded-lg p-4 text-left">
                    <div className="flex items-center gap-2 text-xs text-green-500 font-mono mb-2">
                      <Key className="w-3 h-3" /> Otomatik Dijital Teslimat
                    </div>
                    <div className="text-sm font-mono text-primary neon-text break-all">{product.delivery_data || "Veri bekleniyor..."}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm font-mono text-orange-400">
                      <Truck className="w-4 h-4" />
                      {deliveryMethod === "cargo" && "Kargo/teslimat süreci başlatıldı"}
                      {deliveryMethod === "dead_drop" && "Dead-Drop konumu ayarlanıyor"}
                      {deliveryMethod === "mailbox" && "Anonim posta kutusu teslimatı başlatıldı"}
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Teslimatı aldığınızda siparişlerinizden onaylayın • 7 gün içinde onaylanmazsa otomatik dispute açılır
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
