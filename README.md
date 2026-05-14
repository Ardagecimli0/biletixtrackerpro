    <p><strong>Biletix Tracker Pro</strong>, bilet satış acenteleri, organizasyon ekipleri ve bireysel kullanıcılar için tasarlanmış profesyonel bir tarayıcı eklentisidir. Biletix onay sayfalarındaki kritik verileri manuel kopyalama zahmetinden kurtararak anında yakalar ve güvenli bir yerel arşiv oluşturur.</p>

    <h2>✨ Temel Özellikler</h2>
    <div class="feature-grid">
        <div class="feature-item">
            <strong>⚡ Otomatik Veri Yakalama:</strong> Satın alma sonrası onay sayfası yüklendiği anda referans numarası, tutar, müşteri bilgileri ve koltuk detayları saniyeler içinde ayrıştırılır.
        </div>
        <div class="feature-item">
            <strong>📂 Akıllı İşlem Arşivi:</strong> Tüm geçmiş işlemleriniz <code>chrome.storage</code> üzerinde saklanır. Sayfayı kapatsanız dahi verilere popup üzerinden erişebilirsiniz.
        </div>
        <div class="feature-item">
            <strong>🔍 Gelişmiş Arama:</strong> Yüzlerce işlem arasından referans numarası veya müşteri adına göre anında filtreleme yapın.
        </div>
        <div class="feature-item">
            <strong>🔄 İptal/İade Kolaylığı:</strong> İade süreçlerinde gereken tüm veriler elinizin altındadır, operasyonel hataları minimuma indirir.
        </div>
    </div>

    <h2>🛠️ Teknik Stack</h2>
    <ul>
        <li><strong>Frontend:</strong> HTML5, CSS3 (Modern UI)</li>
        <li><strong>Logic:</strong> JavaScript (ES6+)</li>
        <li><strong>Platform:</strong> Chrome Extension Manifest V3</li>
        <li><strong>API:</strong> Chrome Storage API, Content Scripts, Service Workers</li>
    </ul>

    <h2>📂 Proje Yapısı</h2>
    <div class="code-block">
├── manifest.json      # Eklenti yetki ve yapılandırma dosyası
├── background.js      # Arka plan servisleri ve olay yönetimi
├── content.js         # Sayfa üzerinden veri çekme mantığı (DOM Scraping)
├── popup.html         # Kullanıcı arayüzü (Dashboard)
├── popup.js           # Arayüz etkileşimleri ve veri listeleme
├── style.css          # Modern ve temiz tasarım stili
└── assets/            # İkonlar ve görsel materyaller</div>

    <h2>🚀 Kurulum Talimatları</h2>
    <ol>
        <li>Projeyi <code>ZIP</code> olarak indirin veya klonlayın.</li>
        <li>Chrome tarayıcınızda <code>chrome://extensions/</code> adresine gidin.</li>
        <li>Sağ üstteki <strong>"Geliştirici Modu"</strong>nu aktif hale getirin.</li>
        <li><strong>"Paketlenmemiş öğe yükle"</strong> butonuna tıklayın ve proje klasörünü seçin.</li>
        <li>Eklenti simgesini araç çubuğuna sabitleyerek kullanmaya başlayın.</li>
    </ol>

    <h2>📈 Gelecek Planlaması</h2>
    <ul>
        <li>✅ Excel/CSV formatında dışa aktarma (Export)</li>
        <li>✅ Çoklu cihaz senkronizasyonu</li>
        <li>✅ Günlük/Aylık satış raporlama grafikleri</li>
        <li>✅ Diğer biletleme platformları için destek (Passo, Bubilet vb.)</li>
    </ul>

    <h2>📄 Lisans</h2>
    <p>Bu proje <strong>Apache License 2.0</strong> kapsamında lisanslanmıştır.</p>

    <div style="margin-top: 40px; font-size: 9pt; color: #666; text-align: center;">
        Biletix Tracker Pro - Operasyonel Verimlilik İçin Tasarlanmıştır.
    </div>
</body>
</html>
"""

from weasyprint import HTML
import os

# Create HTML file
with open("README_Visual.html", "w", encoding="utf-8") as f:
    f.write(html_content)

# Convert to PDF
HTML(filename="README_Visual.html").write_pdf("Biletix_Tracker_Pro_README.pdf")

# Create a high-quality Markdown file as well
md_content = """# 🚀 Biletix Tracker Pro

**Biletix Tracker Pro**, bilet satış acenteleri, organizasyon ekipleri ve operasyonel birimler için geliştirilmiş, Biletix onay sayfalarındaki işlem verilerini otomatik olarak yakalayan ve yöneten modern bir Chrome eklentisidir.

Manuel veri girişini ortadan kaldırarak; referans numaralarını, müşteri detaylarını ve bilet bilgilerini saniyeler içinde arşivlemenizi sağlar.

---

## ✨ Temel Özellikler

### 🔍 Otomatik İşlem Yakalama
Onay sayfası yüklendiği anda eklenti devreye girer ve aşağıdaki verileri otomatik olarak ayrıştırır:
* **Referans Numaraları:** Tek tıkla kopyalamaya hazır.
* **Müşteri Bilgileri:** Ad, soyad ve iletişim detayları.
* **Mali Detaylar:** Toplam tutar, hizmet bedelleri ve ödeme yöntemleri.
* **Koltuk Bilgisi:** Blok, sıra ve koltuk numaraları.
* **Zaman Damgası:** Her işlemin tam gerçekleşme zamanı.

### 📜 Geçmiş Arşivi & Yönetim
`chrome.storage` üzerinde güvenli bir şekilde saklanan verilerinizle:
* Geçmiş satışlara anında göz atın.
* Referans numarasına göre akıllı arama yapın.
* Operasyon geçmişini kronolojik olarak takip edin.

### ⚡ İptal ve İade Kolaylığı
Verilerin elinizin altında olması sayesinde:
* İade süreçlerini hızlandırın.
* Hatalı veri girişinden kaynaklanan operasyonel riskleri sıfırlayın.
* Onay sayfasını kapatsanız bile verilere popup üzerinden erişin.

---

## 🛠️ Teknoloji Yığını

Bu proje, Google'ın en güncel tarayıcı standartları olan **Manifest V3** mimarisi üzerine inşa edilmiştir.

* **Logic:** JavaScript (ES6+)
* **UI/UX:** HTML5 & CSS3 (Modern & Responsive Popup)
* **Architecture:** Chrome Extension Manifest V3
* **Storage:** Chrome Storage API (Local Persistence)
* **Engine:** Content Scripts & Service Workers

---

## 📂 Proje Yapısı

```bash
├── manifest.json      # Eklenti yapılandırması (Manifest V3)
├── background.js      # Arka plan servis işleyicisi
├── content.js         # Sayfa içi veri kazıma mantığı
├── popup.js           # Arayüz etkileşim yönetimi
├── popup.html         # Yönetim paneli arayüzü
├── style.css          # Modern görsel tasarım
└── assets/            # İkonlar ve görsel varlıklar


## 📄 Lisans
Bu proje Apache License 2.0 altında lisanslanmıştır.
