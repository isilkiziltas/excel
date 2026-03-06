# Olympus Gold CRM

Müşteri takip süreçlerinizi dijitalleştiren, Excel bağımlılığını azaltan ve "Akıllı Hatırlatıcı" özelliğiyle otomatik 7 günlük arama planlamaları yapabilen modern, "Senior" seviyesi bir Web CRM Sistemi.

## 🚀 Özellikler

- **Müşteri Yönetimi:** Yeni müşterileri manuel olarak veya tek tıkla Excel (`.xlsx`) dosyalarından içeri aktararak sisteme kaydedebilirsiniz.
- **Akıllı Hatırlatıcı (7 Gün Mantığı):** Bir müşterinin durumunu "Ulaşılamadı" veya "Tekrar Aranacak" olarak işaretlediğinizde sistem arka planda otomatik olarak tam **7 gün sonrasına** yeni bir arama hatırlatıcısı kurar.
- **Toplu İşlemler:** Onlarca müşteriyi aynı anda seçerek tek bir işlemle tümüne 7 günlük hatırlatıcı kurabilir ve ortak not yazabilirsiniz.
- **Dashboard ve İstatistikler:** Toplam müşteri sayısını, bugün aranması gerekenleri ve tarihi geçmiş geciken aramaları tek bir ana ekranda (Dashboard) takip edebilirsiniz.
- **Kurumsal Tasarım:** Olympus Gold markasına uygun; temiz, aydınlık tema (Light Mode), kırmızı vurgular ve **Oswald** typography içeren modern UI/UX mimarisi.

## 🛠 Kullanılan Teknolojiler

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Next.js API Routes (Serverless Functions)
- **Veritabanı:** SQLite (Kurulum gerektirmez, projeye dahildir)
- **ORM:** Prisma
- **Stil:** Pure CSS (Premium Light Mode UI)

## 📦 Kurulum ve Çalıştırma

Bu projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler
- Node.js (v18 veya üzeri önerilir)

### Adımlar

1. **Projeyi indirin veya klonlayın:**
```bash
git clone https://github.com/isilkiziltas/excel.git
cd excel/crm-app
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Veritabanını hazırlayın (Prisma):**
```bash
npx prisma generate
npx prisma db push
```

4. **Projeyi başlatın:**
```bash
npm run dev
```

5. **Tarayıcıda açın:**
Tarayıcınızı açın ve aşağıdaki adrese gidin:
[http://localhost:3000](http://localhost:3000)

## 📁 Klasör Yapısı

* `src/app/` - Sayfa ve API yönlendirmelerinin (Routing) bulunduğu çekirdek dizin.
* `src/app/api/` - Backend işlemlerini yürüten API uç noktaları.
* `src/app/customers/` - Müşteri listesinin, ekleme modüllerinin ve toplu işlemlerin bağlandığı sayfa.
* `prisma/` - Veritabanı şeması ve SQLite dosyası (`dev.db`).

## ✍️ Notlar
* Geliştirme ortamı için hiçbir veritabanı kurulumuna ihtiyaç yoktur; SQLite otomatik çalışır.
* Eklemek istediğiniz müşteri Excel verilerinin sütun isimleri "MÜŞTERİ ADI" ve "TEL NO" formatlarına uygun olmalıdır.
