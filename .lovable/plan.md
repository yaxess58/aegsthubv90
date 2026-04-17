

Kullanıcı birden fazla sorun ve özellik bildirdi. Plan yapmadan önce kodu hızlıca inceleyeyim.

Sorunlar:
1. Profil ve banner koyarken hata - storage bucket eksik (DB'de bucket yok)
2. Ürünlerde satıcı profilleri yok - market/product detail satıcı bilgisini göstermiyor
3. Satıcılar da ürün alabilmeli - şu an vendor rolü market'e giremiyor olabilir
4. Satıcılar kategori seçebilmeli - VendorDashboard'da kategori alanı yok ama products tablosunda category sütunu var
5. Admin her şeyi test edebilmeli - admin için ürün ekleme/satın alma yetkisi

Hızlıca App.tsx, Profile, Market, Customization sayfalarını incelemem gerek planı netleştirmek için.

# Düzeltme ve İyileştirme Planı

## Tespit Edilen Sorunlar

1. **Profil/Banner yükleme hatası**: Storage bucket'lar (`avatars`, `banners`, `product-images`) veritabanında tanımlı değil → upload başarısız oluyor
2. **Ürünlerde satıcı yok**: Market ve ProductDetail sayfaları `vendor_id`'yi `profiles` tablosuyla join etmiyor → satıcı adı görünmüyor
3. **Satıcılar alışveriş yapamıyor**: Sidebar'da vendor rolüne `Market` ve `Orders` linkleri yok
4. **Kategori seçimi yok**: VendorDashboard'da ürün eklerken kategori alanı eksik (DB'de `category` sütunu var ama form'da yok)
5. **Admin test yetkisi**: Admin sidebar'ında `Market`, `Orders`, `My Products` linkleri yok → admin alıcı/satıcı akışını test edemiyor

## Yapılacaklar

### 1. Storage Bucket'ları Oluştur (Migration)
- `avatars` bucket (public, 2MB limit, image/*)
- `banners` bucket (public, 5MB limit, image/*)
- `product-images` bucket (public, 5MB limit, image/*)
- Her bucket için RLS: kullanıcı kendi `{user_id}/...` klasörüne yükleyebilir, herkes okuyabilir

### 2. Satıcı Profillerini Ürünlere Bağla
- `src/pages/Market.tsx`: `products` çekerken `profiles` join et, ürün kartında "Satıcı: {display_name}" göster, satıcı profiline tıklanabilir link ekle
- `src/pages/ProductDetail.tsx`: Satıcı bilgisi bölümüne avatar + display_name + rating ekle, `/vendor/{vendor_id}` linki

### 3. Satıcılara Alışveriş Erişimi
- `src/components/AppSidebar.tsx` `vendorLinks`: `Market` ve `My Orders` linklerini ekle
- ProductDetail'de "kendi ürününü satın alamazsın" kontrolü (vendor_id === user.id ise butonu disable)

### 4. Kategori Sistemi
- `src/pages/VendorDashboard.tsx`: Form'a kategori `<select>` alanı ekle (Dijital Hesap, Yazılım, Servis, E-kitap, Diğer vb.)
- Insert'e `category` field'ı ekle
- Ürün listesinde kategori badge'i göster
- `src/pages/Market.tsx`: Üstte kategori filtre çipleri ekle ("Tümü" + kategoriler)

### 5. Admin Test Modu
- `AppSidebar.tsx` `adminLinks`: `Market`, `My Orders`, `My Products (vendor)`, `Vendor Wallet` linklerini ekle
- `App.tsx`: Admin'in `/vendor`, `/orders`, `/market`, `/vendor/wallet` sayfalarına erişebildiğinden emin ol (ProtectedRoute role kontrolünü gevşet)
- `VendorDashboard.tsx` ve `Orders.tsx`: admin user_id'siyle de çalışabilsin

### 6. Customization Sayfası React Ref Uyarısı
- `src/pages/Customization.tsx` `Section` bileşenine ref forward'lanıyor → `forwardRef` ile sar (console error'ı temizler)

## Dosyalar
- Yeni migration: storage bucket'lar + RLS politikaları
- `src/pages/Market.tsx` — satıcı join + kategori filtresi
- `src/pages/ProductDetail.tsx` — satıcı kartı + own-product guard
- `src/pages/VendorDashboard.tsx` — kategori alanı
- `src/components/AppSidebar.tsx` — admin/vendor için ek linkler
- `src/pages/Customization.tsx` — `forwardRef` düzeltmesi
- `src/App.tsx` — gerekirse admin route erişimi

## Dokunulmayacaklar
- Ödeme akışı, escrow, RPC fonksiyonları (zaten çalışıyor)
- Mevcut RLS policy'leri (sadece storage için yeni eklenecek)

