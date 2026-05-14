🎫 Biletix Tracker Pro | Geliştirme Planı
Bu döküman, eklentinin görsel olarak modernize edilmesi ve kullanıcı deneyiminin (UX) profesyonel seviyeye çıkarılması için gereken adımları tanımlar.

🎨 1. Görsel Kimlik (UI/UX)
Ana Tema: Biletix Mavisi (#0055FE) ve Saf Beyaz kontrastı.

Header: - Arka plan tamamen Biletix mavisi.

Ortalanmış beyaz "BILETIX" logosu (Modern sans-serif font).

Altında küçük, şık bir "Tracker Pro" ibaresi.

Kart Tasarımı:

Beyaz arka plan, hafif gölge (box-shadow).

Sol kenarda mavi bir vurgu çizgisi (border-left).

Fiyatlar için sağ üstte yeşil, dikkat çekici etiketler.

🛠 2. Temel Fonksiyonlar
[ ] Akıllı Kaydırma (Scroll): Liste alanı max-height ile sabitlenecek, son 30 işlem bittiğinde şık bir scrollbar çıkacak.

[ ] Tek Tık Kopyala (Quick Copy): - Referans numarasına tıklandığında otomatik panoya kopyalama.

Ekranın altında siyah bir "Kopyalandı!" toast bildirimi.

[ ] Gelişmiş Filtreleme: Hem referans numarasına hem de müşteri ismine göre anlık arama.

[ ] Veri Sınırı: Performans için panelde sadece en güncel 30 kayıt gösterilecek (Eski kayıtlar hafızada saklanmaya devam eder).

📁 3. Dosya Güncelleme Takvimi
Aşama 1: Arayüz Giydirme (popup.html & style.css)
[ ] Mavi header yapısının kurulması.

[ ] Scrollbar ve kart tasarımlarının CSS'e eklenmesi.

[ ] Mobil uygulama hissiyatı veren font optimizasyonları.

Aşama 2: Fonksiyonel Kodlama (popup.js)
[ ] navigator.clipboard API entegrasyonu.

[ ] slice(0, 30) ile liste kısıtlama mantığı.

[ ] Toast notification animasyonunun eklenmesi.

Aşama 3: Veri Derinleştirme (content.js)
[ ] Onay sayfasından sadece fiyatı değil, etkinlik adını da alacak şekilde selector güncellemesi.