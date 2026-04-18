

# Yeraltı Marketi Profesyonel Yükseltme Planı

Kullanıcı 4 büyük özellik bloğu istiyor. Hepsini tek seferde uygulayacağım, ancak basitlik ve istikrar için **mevcut ödeme akışına dokunmuyorum**.

---

## 1. Güvenlik & Oturum Protokolü

### A. Kayıt Formuna Yeni Alanlar
- **DB değişikliği**: `profiles` tablosuna iki alan ekle:
  - `withdraw_pin_hash` (text, nullable) — 6 haneli PIN'in SHA-256 hash'i (ham PIN asla saklanmaz)
  - `pgp_public_key` (text, nullable) — zaten `pgp_key` mevcut, onu kullanacağız (gereksiz duplicate yok)
- **`Login.tsx`**: Signup formuna iki alan ekle:
  - "Para Çekme PIN'i (6 hane)" — sadece rakam
  - "PGP Public Key" (textarea, opsiyonel)
- **`authContext.tsx`** `signup`: PIN'i `crypto.subtle.digest('SHA-256', ...)` ile hashle, signup sonrası `profiles` tablosuna kaydet

### B. Session Timer (Oturum Süresi)
- **`Login.tsx`**: Login formunun üstüne 3 seçenek tab'ı: 30dk / 1sa / 2sa (default 1sa)
- Seçim `localStorage.setItem("session_duration_min", "30|60|120")` olarak kaydedilir
- **Yeni context: `src/lib/sessionTimerContext.tsx`**:
  - Login olduğunda `Date.now() + duration * 60_000` değerini `localStorage.setItem("session_expires_at", ts)` olarak yazar
  - Her saniye kalan süreyi hesaplar
  - 0'a ulaşınca: `supabase.auth.signOut()` + tüm `localStorage` ve `sessionStorage` temizliği + cookie temizliği + `navigate("/")`
- **Yeni component: `src/components/SessionTimerBadge.tsx`**:
  - Sağ üst köşede sabit `fixed top-4 right-4 z-50` rozet
  - `HH:MM:SS` formatında geri sayım
  - Son 5 dakikada kırmızıya döner ve titrer
- **`PageShell.tsx`**: SessionTimerBadge'i göster (sadece login sonrası sayfalarda)

---

## 2. Wallet Sayfası (LTC Adresi)

- **Yeni sayfa: `src/pages/Wallet.tsx`** — kullanıcının kişisel cüzdan sayfası (vendor wallet'tan farklı)
- **Yeni route**: `/wallet` (App.tsx, tüm rollere açık)
- **Yeni sidebar linki**: tüm rollerde "Wallet" / `Coins` ikonu
- İçerik:
  - "Generate New LTC Address" butonu
  - Tıklayınca: kriptografik olarak rastgele bir LTC bech32-benzeri adres üret (ltc1q... + 38 hex karakter, gerçek bech32 doğrulamasına gerek yok — UI amaçlı)
  - QR kod (`qrcode.react`) ile göster
  - Kopyala butonu
  - Kırmızı uyarı: "⚠️ Bu adres 24 saat geçerlidir. Süresi dolduktan sonra ödeme yaparsanız fonlar kaybolur."
  - Mavi info: "ℹ️ Bakiyeniz 3 ağ onayından sonra güncellenecektir."
  - Adres + üretilme zamanı `localStorage`'a kaydedilir, 24 saatten eski ise "süresi dolmuş" gösterimi
  - Geri sayım rozeti (24h - elapsed)

---

## 3. Ürün Mimarisi: Origin/Destination + Modal

### A. DB değişikliği
- `products` tablosuna ekle:
  - `origin` (text, nullable)
  - `destination` (text, nullable)
- Mevcut `category` alanını standart 3 kategoriye sınırla (UI'da select):
  - "Dijital Veriler", "Lojistik Rotaları", "VIP Erişim"

### B. UI değişiklikleri
- **`VendorDashboard.tsx`** ürün ekleme formu:
  - Kategori `<select>`'ini bu 3 seçenekle güncelle (mevcut serbest kategori sistemi varsa onu sınırla)
  - "Origin" ve "Destination" input alanları ekle
- **`Market.tsx`** ürün kartı:
  - Origin → Destination göster: `📍 Istanbul → Berlin` formatında küçük etiket
  - Kategori chip filtresi: 3 sabit kategori
- **Yeni component: `src/components/ProductDescriptionModal.tsx`** — `Dialog`-tabanlı, koyu temayla uyumlu, açıklamayı modal içinde göster
- **`Market.tsx`**: kart üzerinde "Detaylar" linki modalı açar (ürün sayfasına gitmeden hızlı önizleme); ana tıklama hala `/product/:id`'ye götürür

---

## 4. Kızılyürek AI Asistanı

- **Yeni edge function: `supabase/functions/kizilyurek-chat/index.ts`**:
  - Lovable AI Gateway (`google/gemini-3-flash-preview`) ile çalışır
  - Sistem prompt: "Sen Kızılyürek, aeigsthub yeraltı marketinin operasyonel destek asistanısın. Kullanıcılara LTC ödemeleri, escrow sistemi, güvenlik protokolleri (2FA, PGP, oturum süresi), dispute süreci ve teslimat yöntemleri hakkında kısa, net ve operasyonel cevaplar ver. Türkçe konuş. Asla gerçek illegal aktiviteleri teşvik etme — sadece platform kullanımı hakkında bilgi ver."
  - `verify_jwt = false` (chat herkese açık)
  - Streaming response (mevcut SSE pattern)
- **Yeni component: `src/components/KizilyurekAssistant.tsx`**:
  - Sağ alt köşede sabit (`fixed bottom-4 right-4 z-40`) yuvarlak buton (Bot ikonu, kırmızı glow)
  - Tıklayınca açılan chat paneli (320×480 popup)
  - Hızlı sorular (chips): "LTC nasıl yatırılır?", "Güvenlik protokolleri", "Dispute nasıl açılır?", "Oturum süresi"
  - Markdown render (`react-markdown` zaten yüklü değilse ekle)
  - Streaming token-by-token
- **Session warning entegrasyonu**:
  - `KizilyurekAssistant`, `useSessionTimer()` context'i izler
  - Kalan süre 5 dakikaya düşünce **otomatik** olarak chat'i açar ve sistem mesajı ekler:
    > 🚨 İzlerini silmek için süren doluyor Operatör. Kalan süre: X:XX
- **`PageShell.tsx`**: KizilyurekAssistant'ı tüm sayfalarda göster

---

## Dosya Değişiklikleri

**Yeni dosyalar**:
- `src/lib/sessionTimerContext.tsx`
- `src/components/SessionTimerBadge.tsx`
- `src/components/KizilyurekAssistant.tsx`
- `src/components/ProductDescriptionModal.tsx`
- `src/pages/Wallet.tsx`
- `supabase/functions/kizilyurek-chat/index.ts`
- 2 migration: `profiles.withdraw_pin_hash`, `products.origin`/`destination`

**Düzenlenecekler**:
- `src/lib/authContext.tsx` (signup: PIN hash + PGP key kaydet)
- `src/pages/Login.tsx` (PIN, PGP, session timer seçimi)
- `src/components/PageShell.tsx` (SessionTimerBadge + KizilyurekAssistant mount)
- `src/components/AppSidebar.tsx` (Wallet linki tüm rollere)
- `src/App.tsx` (SessionTimerProvider sarmalı, /wallet route)
- `src/pages/VendorDashboard.tsx` (origin/destination + 3 sabit kategori)
- `src/pages/Market.tsx` (origin→destination etiketi + sabit kategori chip'leri + hızlı modal)
- `supabase/config.toml` (kizilyurek-chat function `verify_jwt = false`)

## Dokunulmayacaklar
- **Ödeme akışı, escrow, RPC fonksiyonları, mevcut RLS policy'leri** — hiçbiri değişmiyor
- Mevcut MFA, anti-phishing kodu, vendor wallet sayfası

## Onaylar
- Yeni bağımlılık: `react-markdown` (Kızılyürek mesajlarını render için)
- 2 migration onayı gerekecek (PIN hash kolonu + ürün origin/destination)

---

Onaylarsan hemen başlıyorum.

