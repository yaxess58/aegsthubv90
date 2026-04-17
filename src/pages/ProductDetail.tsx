import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { QRCodeSVG } from "qrcode.react";
import { ShoppingCart, Clock, Loader2, CheckCircle, Key, Package, Truck, User, Lock, Timer, AlertTriangle, Shield, Hash, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import VendorRating from "@/components/VendorRating";
import DeliveryMethodSelector from "@/components/DeliveryMethodSelector";

const SERVICE_FEE_RATE = 0.05; // %5
const CENTRAL_POOL_ADDRESS = "bc1qpyugsrx9xjvjpcdjkqjwhdm645l0039skthesp";

type PaymentStatus = "idle" | "pending" | "txid_input" | "processing" | "paid";
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
  const [orderId, setOrderId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 min
  const [loading, setLoading] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("cargo");
  const [txid, setTxid] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);

  const serviceFee = product ? product.price * SERVICE_FEE_RATE : 0;
  const totalPrice = product ? product.price + serviceFee : 0;

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from("products").select("id, name, description, price, type, vendor_id, stock, image_emoji, image_url, tracking_number, commission_rate, category").eq("id", id).single();
      if (data) {
        setProduct(data as ProductRow);
        const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", data.vendor_id).single();
        if (profile) setVendorName(profile.display_name || "Anonim Satıcı");
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!timerStart) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      const remaining = Math.max(0, 1800 - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (status === "pending" || status === "txid_input") {
          toast.error("Ödeme süresi doldu!");
          setStatus("idle");
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStart, status]);

  // Prevent browser history leak
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
      vendor_id: product.vendor_id,
      status: "pending",
      amount: totalPrice,
      service_fee: serviceFee,
      delivery_method: product.type === "digital" ? "cargo" : deliveryMethod,
    } as any).select().single();

    if (orderErr) { toast.error("Sipariş oluşturulamadı"); setStatus("idle"); return; }

    setOrderId(order.id);
    setTimerStart(Date.now());

    // After showing address for 3 seconds, allow TXID input
    setTimeout(() => setStatus("txid_input"), 3000);
  };

  const submitTxid = async () => {
    if (!txid.trim() || !orderId) return;
    setVerifying(true);

    // Save TXID to order
    await supabase.from("orders").update({ txid: txid.trim() } as any).eq("id", orderId);

    setStatus("processing");

    // Process payment via RPC (notifies vendor automatically)
    const { data: result, error } = await supabase.rpc("process_order_payment", {
      _order_id: orderId,
      _tx_hash: txid.trim(),
      _ltc_address: CENTRAL_POOL_ADDRESS,
    });

    if (error) {
      toast.error("Ödeme işlenemedi: " + error.message);
      setStatus("txid_input");
    } else {
      setStatus("paid");
      toast.success("Ödeme onaylandı! Satıcıya bildirim gönderildi.");
    }
    setVerifying(false);
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
                <div className="text-sm font-mono text-muted-foreground line-through">{product.price} LTC</div>
                <div className="text-2xl font-mono font-bold text-primary neon-text">{totalPrice.toFixed(4)} LTC</div>
                <div className="text-[10px] font-mono text-yellow-500 mt-0.5">
                  +%{(SERVICE_FEE_RATE * 100).toFixed(0)} Sistem Hizmet Bedeli ({serviceFee.toFixed(4)} LTC)
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono mt-1 ${
                  product.type === "digital" ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"
                }`}>
                  {product.type === "digital" ? <Key className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                  {product.type.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <button
                onClick={() => window.location.assign(`/vendor/${product.vendor_id}`)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary font-mono transition-colors"
              >
                <User className="w-3 h-3" /> {vendorName}
              </button>
              <VendorRating vendorId={product.vendor_id} size="md" />
              <div className="text-xs text-muted-foreground font-mono">Stok: {product.stock}</div>
              {product.category && <div className="text-[10px] font-mono px-2 py-0.5 bg-secondary rounded text-muted-foreground">{product.category}</div>}
            </div>
          </div>
        </div>

        {/* Anonymity Notice */}
        <div className="glass-card rounded-lg p-3 mb-4 flex items-center gap-3 border border-primary/20">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <div className="text-[11px] font-mono font-bold text-primary">Merkezi Havuz Sistemi</div>
            <div className="text-[9px] font-mono text-muted-foreground">Sabit havuz adresi • %5 hizmet bedeli • Otomatik escrow • TXID doğrulama</div>
          </div>
        </div>

        {/* Delivery Method Selection */}
        {status === "idle" && product.type === "physical" && user?.id !== product.vendor_id && (
          <div className="glass-card rounded-lg p-4 mb-4">
            <DeliveryMethodSelector value={deliveryMethod} onChange={setDeliveryMethod} productType={product.type} />
          </div>
        )}

        {status === "idle" && user?.id === product.vendor_id && (
          <div className="glass-card rounded-lg p-4 text-center text-xs font-mono text-muted-foreground border border-yellow-500/30">
            ⚠️ Bu sizin kendi ürününüz — satın alamazsınız.
          </div>
        )}

        {status === "idle" && user?.id !== product.vendor_id && (
          <motion.button
            onClick={startPayment}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-lg font-mono font-bold neon-glow-btn text-sm"
          >
            <ShoppingCart className="w-4 h-4" /> SATIN AL — {totalPrice.toFixed(4)} LTC
          </motion.button>
        )}

        {status !== "idle" && (
          <div className="glass-card rounded-lg p-6 neon-border">
            {/* Order ID */}
            <div className="flex items-center gap-2 mb-4 p-2 bg-secondary rounded">
              <Hash className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">Sipariş Kimliği:</span>
              <span className="text-xs font-mono text-foreground font-bold">{orderId.slice(0, 8).toUpperCase()}</span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-6 mb-4">
              {(["pending", "txid_input", "processing", "paid"] as const).map((s, i) => {
                const labels = ["Adres", "TXID", "Onay", "Ödendi"];
                const currentIdx = ["pending", "txid_input", "processing", "paid"].indexOf(status);
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                      status === s ? "bg-primary text-primary-foreground animate-pulse" :
                      (currentIdx > i ? "bg-green-600 text-white" : "bg-secondary text-muted-foreground")
                    }`}>
                      {currentIdx > i ? <CheckCircle className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{labels[i]}</span>
                    {i < 3 && <div className="w-6 h-px bg-border" />}
                  </div>
                );
              })}
            </div>

            {/* Pending: Show address */}
            {(status === "pending" || status === "txid_input") && (
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 ${
                  timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  <Timer className="w-3 h-3" />
                  Kalan Süre: {formatTime(timeLeft)}
                  {timeLeft < 300 && <AlertTriangle className="w-3 h-3" />}
                </div>
                <p className="text-xs text-muted-foreground font-mono mb-3">
                  Merkezi havuz adresine <span className="text-primary font-bold">{totalPrice.toFixed(4)} LTC</span> gönderin:
                </p>
                <div className="inline-block p-3 bg-secondary rounded-lg mb-3">
                  <QRCodeSVG value={`litecoin:${CENTRAL_POOL_ADDRESS}?amount=${totalPrice.toFixed(4)}`} size={160} bgColor="transparent" fgColor="#d9d9d9" />
                </div>
                <div className="bg-secondary rounded px-3 py-2 text-xs font-mono text-foreground break-all flex items-center gap-2 mb-4">
                  <Lock className="w-3 h-3 text-primary flex-shrink-0" />
                  {CENTRAL_POOL_ADDRESS}
                </div>

                {/* TXID Input */}
                {status === "txid_input" && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs font-mono text-muted-foreground mb-2">Ödeme yaptıktan sonra TXID'nizi girin:</p>
                    <div className="flex gap-2">
                      <input
                        value={txid}
                        onChange={(e) => setTxid(e.target.value)}
                        placeholder="İşlem Hash (TXID)"
                        className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        onClick={submitTxid}
                        disabled={!txid.trim() || verifying}
                        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-mono rounded font-bold neon-glow-btn flex items-center gap-1 disabled:opacity-50"
                      >
                        {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        Doğrula
                      </button>
                    </div>
                  </div>
                )}

                {status === "pending" && (
                  <div className="flex items-center justify-center gap-1 mt-3 text-xs text-yellow-500 font-mono">
                    <Clock className="w-3 h-3" /> Adres hazırlanıyor...
                  </div>
                )}
              </div>
            )}

            {status === "processing" && (
              <div className="text-center py-4">
                <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
                <p className="text-sm font-mono text-muted-foreground">İşlem doğrulanıyor...</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">Escrow havuzuna aktarılıyor</p>
              </div>
            )}

            {status === "paid" && (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-mono text-green-500 font-bold mb-2">Ödeme Onaylandı!</p>
                <p className="text-[10px] font-mono text-muted-foreground mb-3">Satıcıya otomatik bildirim gönderildi</p>
                {product.type === "digital" ? (
                  <div className="bg-secondary rounded-lg p-4 text-left">
                    <div className="flex items-center gap-2 text-xs text-green-500 font-mono mb-2">
                      <Key className="w-3 h-3" /> Dijital Teslimat
                    </div>
                    <div className="text-sm font-mono text-muted-foreground">Teslimat verisi siparişlerinizden görüntülenecektir.</div>
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
