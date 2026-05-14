// ==========================================
// Biletix Tracker Pro - Content Script
// Onay sayfasından satış verilerini çeker
// Popup AÇIK OLMASA DA çalışır!
// ==========================================

(function () {
    'use strict';

    // Çoklu injection koruması — script tekrar inject edildiğinde
    // flag'i sıfırla ve tekrar dene (SPA navigasyon desteği)
    if (window.__biletixTrackerLoaded) {
        window.__biletixTrackerAlreadySaved = false;
        console.log('[Biletix Tracker] 🔄 Yeniden inject edildi, tekrar deneniyor...');
        if (typeof window.__biletixTryExtract === 'function') {
            window.__biletixTryExtract();
        }
        return;
    }
    window.__biletixTrackerLoaded = true;

    let alreadySaved = false;
    let lastSavedReference = null;

    // Sayfanın onay sayfası olup olmadığını kontrol et
    function isConfirmationPage() {
        return document.querySelector('.event-confirmation-page') !== null;
    }

    // Referans numarasını çek
    function getReference() {
        // Gerçek yapı: .confirmation-reference-number > h4
        const container = document.querySelector('.confirmation-reference-number');
        if (!container) return null;

        const h4 = container.querySelector('h4');
        if (h4) return h4.textContent.trim();

        // Fallback: doğrudan text
        return container.textContent.replace(/Referans Numarası:?/gi, '').trim();
    }

    // Müşteri bilgisini çek
    function getCustomerInfo() {
        const section = document.querySelector('.confirmation-user-info');
        if (!section) return { name: null, phone: null };

        const nameEl = section.querySelector('.user-name');
        const phoneEl = section.querySelector('.phone-number');

        const name = nameEl ? nameEl.textContent.trim() : null;
        const phone = phoneEl ? phoneEl.textContent.trim() : null;

        return { name, phone };
    }

    // Ödeme bilgisini çek
    function getPaymentInfo() {
        const container = document.querySelector('.confirmation-shopping-result');
        if (!container) return { paymentMethod: null, paymentAmount: null, installment: null };

        const methodEl = container.querySelector('.payment-name');
        const amountEls = container.querySelectorAll('.payment-amount');

        const paymentMethod = methodEl ? methodEl.textContent.trim() : null;

        let paymentAmount = null;
        let installment = null;

        amountEls.forEach(el => {
            const text = el.textContent.trim();
            if (text.includes('Taksit')) {
                installment = text;
            } else if (text.includes('TL') || text.includes('₺')) {
                paymentAmount = text;
            }
        });

        return { paymentMethod, paymentAmount, installment };
    }

    // Etkinlik / alışveriş bilgisini çek
    function getShoppingInfo() {
        const container = document.querySelector('.confirmation-shopping-info');
        if (!container) return { eventName: null };

        const cells = container.querySelectorAll('td, .confirmation-shopping-item span');
        let eventName = null;

        cells.forEach(cell => {
            const text = cell.textContent.trim();
            if (text.length > 5 && !text.includes('TL') && !text.includes('₺') && !eventName) {
                eventName = text;
            }
        });

        if (!eventName) {
            const heading = document.querySelector('.event-confirmation-content h2, .confirmation-shopping-info h3');
            if (heading) {
                const text = heading.textContent.trim();
                if (text !== 'Onay' && text !== 'İşlem Özeti' && text !== 'Ödeme') {
                    eventName = text;
                }
            }
        }

        return { eventName };
    }

    // Ana veri toplama
    function extractSaleData() {
        if (!isConfirmationPage()) return null;

        const reference = getReference();
        if (!reference) {
            console.log('[Biletix Tracker] ⚠️ Referans numarası bulunamadı.');
            return null;
        }

        // Aynı referansı tekrar kaydetme
        if (reference === lastSavedReference) {
            console.log('[Biletix Tracker] ⏭ Bu referans zaten kaydedildi:', reference);
            return null;
        }

        const customer = getCustomerInfo();
        const payment = getPaymentInfo();
        const shopping = getShoppingInfo();

        const data = {
            reference,
            customerName: customer.name,
            customerPhone: customer.phone,
            eventName: shopping.eventName,
            paymentMethod: payment.paymentMethod,
            totalPrice: payment.paymentAmount,
            installment: payment.installment,
            status: 'active',
            date: new Date().toISOString(),
            url: window.location.href
        };

        console.log('[Biletix Tracker] 📋 Çekilen veri:', data);
        return data;
    }

    // Background'a gönder ve kaydet
    function saveSale(saleData) {
        chrome.runtime.sendMessage({
            action: 'saveSale',
            data: saleData
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('[Biletix Tracker] ⚠️ Mesaj gönderilemedi:', chrome.runtime.lastError.message);
                // Doğrudan storage'a yaz (fallback)
                directSave(saleData);
                return;
            }
            if (response && response.success) {
                console.log('[Biletix Tracker] ✅ Satış kaydedildi:', saleData.reference);
                lastSavedReference = saleData.reference;
            }
        });
    }

    // Doğrudan storage'a kaydet (background erişilemezse)
    function directSave(saleData) {
        chrome.storage.local.get('sales', (result) => {
            const sales = result.sales || [];
            const exists = sales.some(s => s.reference === saleData.reference);
            if (!exists) {
                sales.push(saleData);
                chrome.storage.local.set({ sales }, () => {
                    console.log('[Biletix Tracker] ✅ Doğrudan kaydedildi:', saleData.reference);
                    lastSavedReference = saleData.reference;
                });
            } else {
                lastSavedReference = saleData.reference;
            }
        });
    }

    // Veri çekmeyi dene
    function tryExtract() {
        const saleData = extractSaleData();
        if (saleData) {
            alreadySaved = true;
            saveSale(saleData);
            return true;
        }
        return false;
    }

    // Window'a expose et (re-injection'da erişilebilmesi için)
    window.__biletixTryExtract = tryExtract;

    // ==========================================
    // "Satışı Tamamla" butonunu izle
    // Link değişmeden referans kodu oluşuyor, 
    // bu yüzden DOM değişikliğini sürekli izlememiz lazım
    // ==========================================
    function watchForConfirmation() {
        console.log('[Biletix Tracker] 👀 Onay sayfası / DOM değişiklikleri izleniyor...');

        // Sayfadaki TÜM DOM değişikliklerini izle
        const observer = new MutationObserver((mutations) => {
            // Confirmation page yeni oluştu mu kontrol et
            if (isConfirmationPage()) {
                const ref = getReference();
                if (ref && ref !== lastSavedReference) {
                    console.log('[Biletix Tracker] 🎯 Yeni referans algılandı:', ref);
                    alreadySaved = false;
                    tryExtract();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // 3 dakika sonra observer'ı durdur ve yenisini başlat (bellek optimizasyonu)
        setTimeout(() => {
            observer.disconnect();
            console.log('[Biletix Tracker] ⏰ Observer yeniden başlatılıyor...');
            // Tekrar başlat — kullanıcı uzun süre sayfada kalabilir
            watchForConfirmation();
        }, 180000);

        return observer;
    }

    // Başlat
    function init() {
        console.log('[Biletix Tracker] 🚀 Init başlatıldı.');

        // İlk deneme
        tryExtract();

        // Periyodik olarak tekrar dene (referans kodu gecikmeli oluşabilir)
        if (!alreadySaved) {
            let retryCount = 0;
            const retryTimes = [5, 10, 15, 20, 25]; // Bu saniyelerde dene
            retryTimes.forEach(sec => {
                setTimeout(() => {
                    if (lastSavedReference) return; // Zaten kaydedildi
                    console.log(`[Biletix Tracker] 🔄 ${sec}. saniye denemesi`);
                    tryExtract();
                }, sec * 1000);
            });
        }

        // Ana gözlemci: DOM değişikliklerini sürekli izle
        // "Satışı tamamla" butonuna basıldığında URL değişmeden 
        // referans kodu DOM'a ekleniyor — bunu yakalamak için
        watchForConfirmation();
    }

    // Popup'tan gelen "tekrar çek" mesajını dinle
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'retryExtract') {
            console.log('[Biletix Tracker] 🔄 Tekrar çekme isteği alındı.');
            alreadySaved = false;
            lastSavedReference = null; // Yeniden kaydetmeye izin ver

            const saleData = extractSaleData();
            if (saleData) {
                alreadySaved = true;
                saveSale(saleData);
                sendResponse({ success: true, data: saleData });
            } else {
                sendResponse({ success: false, reason: 'Onay sayfası bulunamadı veya veri çekilemedi.' });
            }
        }
        return true; // async response
    });

    // DOM hazır olduğunda HEMEN çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();