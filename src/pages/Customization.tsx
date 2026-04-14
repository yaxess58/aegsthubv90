import { useCustomization, CustomizationSettings } from "@/lib/customizationContext";
import { useBackground } from "@/lib/backgroundContext";
import PageShell from "@/components/PageShell";
import { Palette, Type, Sparkles, PanelLeft, RotateCcw, ImagePlus, Trash2, Wallpaper } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRef } from "react";

const themePresets = [
  { name: "Kırmızı", hue: 349 },
  { name: "Mavi", hue: 220 },
  { name: "Yeşil", hue: 142 },
  { name: "Mor", hue: 270 },
  { name: "Turuncu", hue: 25 },
  { name: "Camgöbeği", hue: 180 },
  { name: "Pembe", hue: 330 },
  { name: "Sarı", hue: 50 },
];

const fontOptions: { value: CustomizationSettings["fontFamily"]; label: string }[] = [
  { value: "inter", label: "Inter" },
  { value: "jetbrains", label: "JetBrains Mono" },
  { value: "system", label: "Sistem Fontu" },
];

const fontSizeOptions: { value: CustomizationSettings["fontSize"]; label: string }[] = [
  { value: "small", label: "Küçük" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Büyük" },
];

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-lg p-5 neon-border space-y-4"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-mono font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function Customization() {
  const { settings, updateSettings, resetSettings } = useCustomization();
  const { backgroundUrl, setBackgroundUrl, backgroundOpacity, setBackgroundOpacity } = useBackground();
  const bgRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Desteklenen formatlar: JPG, PNG, GIF, WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maksimum dosya boyutu: 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundUrl(reader.result as string);
      toast.success("Arka plan güncellendi! 🎨");
    };
    reader.readAsDataURL(file);
  };

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-mono font-bold text-primary neon-text">Özelleştirme</h1>
          <button
            onClick={() => { resetSettings(); toast.success("Ayarlar sıfırlandı"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border text-xs font-mono rounded hover:border-destructive/30 transition-all text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="w-3 h-3" />
            Sıfırla
          </button>
        </div>

        {/* Theme Color */}
        <Section icon={Palette} title="Tema Rengi">
          <div className="grid grid-cols-4 gap-2">
            {themePresets.map((preset) => (
              <button
                key={preset.hue}
                onClick={() => { updateSettings({ themeHue: preset.hue }); toast.success(`${preset.name} teması uygulandı`); }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                  settings.themeHue === preset.hue
                    ? "border-foreground bg-secondary"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-lg"
                  style={{ backgroundColor: `hsl(${preset.hue}, 100%, 50%)` }}
                />
                <span className="text-[10px] font-mono text-muted-foreground">{preset.name}</span>
              </button>
            ))}
          </div>
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-mono text-muted-foreground">ÖZEL RENK TONU: {settings.themeHue}°</label>
            <input
              type="range"
              min="0"
              max="360"
              value={settings.themeHue}
              onChange={(e) => updateSettings({ themeHue: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))`,
              }}
            />
          </div>
        </Section>

        {/* Font */}
        <Section icon={Type} title="Yazı Tipi">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground mb-2 block">FONT</label>
              <div className="grid grid-cols-3 gap-2">
                {fontOptions.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => updateSettings({ fontFamily: f.value })}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                      settings.fontFamily === f.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted-foreground mb-2 block">BOYUT</label>
              <div className="grid grid-cols-3 gap-2">
                {fontSizeOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateSettings({ fontSize: s.value })}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                      settings.fontSize === s.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Animations */}
        <Section icon={Sparkles} title="Animasyon Ayarları">
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-mono text-foreground">Neon efektleri</span>
              <button
                onClick={() => updateSettings({ neonEnabled: !settings.neonEnabled })}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  settings.neonEnabled ? "bg-primary" : "bg-secondary border border-border"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all ${settings.neonEnabled ? "left-5" : "left-0.5"}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-mono text-foreground">Animasyonlar</span>
              <button
                onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  settings.animationsEnabled ? "bg-primary" : "bg-secondary border border-border"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all ${settings.animationsEnabled ? "left-5" : "left-0.5"}`} />
              </button>
            </label>
          </div>
        </Section>

        {/* Sidebar */}
        <Section icon={PanelLeft} title="Sidebar Düzeni">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground mb-2 block">POZİSYON</label>
              <div className="grid grid-cols-2 gap-2">
                {(["left", "right"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateSettings({ sidebarPosition: pos })}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                      settings.sidebarPosition === pos
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {pos === "left" ? "Sol" : "Sağ"}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-mono text-foreground">Sidebar daralt</span>
              <button
                onClick={() => updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  settings.sidebarCollapsed ? "bg-primary" : "bg-secondary border border-border"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all ${settings.sidebarCollapsed ? "left-5" : "left-0.5"}`} />
              </button>
            </label>
          </div>
        </Section>

        {/* Background Image */}
        <Section icon={Wallpaper} title="Arka Plan Resmi">
          {backgroundUrl && (
            <div className="relative rounded-lg overflow-hidden h-24 border border-border">
              <img src={backgroundUrl} alt="Arka plan" className="w-full h-full object-cover" style={{ opacity: backgroundOpacity }} />
              <div className="absolute inset-0 bg-background/60" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={() => bgRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border text-xs font-mono rounded hover:border-primary/30 transition-all text-foreground"
            >
              <ImagePlus className="w-3.5 h-3.5 text-primary" />
              {backgroundUrl ? "Değiştir" : "Resim Seç"}
            </button>
            {backgroundUrl && (
              <button
                onClick={() => { setBackgroundUrl(null); toast.success("Arka plan kaldırıldı"); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border text-xs font-mono rounded hover:border-destructive/30 transition-all text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kaldır
              </button>
            )}
            <input ref={bgRef} type="file" accept="image/*,.gif" className="hidden" onChange={handleBgUpload} />
          </div>
          {backgroundUrl && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-muted-foreground">OPAKLLIK: {Math.round(backgroundOpacity * 100)}%</label>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                className="w-full accent-primary h-1"
              />
            </div>
          )}
        </Section>
      </div>
    </PageShell>
  );
}
