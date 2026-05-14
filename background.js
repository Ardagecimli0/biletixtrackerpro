// ==========================================
// Biletix Tracker Pro - Background Service Worker
// Mesaj yönetimi ve veri kaydetme
// ==========================================

// Content script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'saveSale') {
        saveSale(message.data)
            .then(() => sendResponse({ success: true }))
            .catch((err) => sendResponse({ success: false, error: err.message }));
        return true; // async response
    }
});

// Satışı storage'a kaydet
async function saveSale(saleData) {
    const result = await chrome.storage.local.get('sales');
    const sales = result.sales || [];

    // Aynı referans numarasıyla daha önce kayıt var mı kontrol et
    const exists = sales.some(s => s.reference === saleData.reference);
    if (exists) {
        console.log('[Biletix Tracker] Bu referans zaten kayıtlı:', saleData.reference);
        return;
    }

    // Yeni satışı ekle (default status: active)
    if (!saleData.status) {
        saleData.status = 'active';
    }
    sales.push(saleData);

    // Storage'a kaydet
    await chrome.storage.local.set({ sales });
    console.log('[Biletix Tracker] ✅ Satış kaydedildi. Toplam:', sales.length);

    // Badge'ı güncelle
    updateBadge(sales.length);
}

// Extension badge'ını güncelle
function updateBadge(count) {
    const text = count > 0 ? count.toString() : '';
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: '#0055FE' });
}

// Başlangıçta badge'ı güncelle
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get('sales', (result) => {
        const sales = result.sales || [];
        updateBadge(sales.length);
    });
});

// Extension yüklendiğinde
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('sales', (result) => {
        const sales = result.sales || [];
        updateBadge(sales.length);
        console.log('[Biletix Tracker] Extension yüklendi. Kayıtlı satış:', sales.length);
    });
});

// ==========================================
// Otomatik Content Script Injection
// SPA navigasyonları ve sayfa yüklemelerini yakala
// ==========================================

// Content script'i inject et
function injectContentScript(tabId) {
    chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
    }).then(() => {
        console.log('[Biletix Tracker] ✅ Content script inject edildi, tabId:', tabId);
    }).catch(err => {
        console.log('[Biletix Tracker] ⚠️ Inject hatası (normal olabilir):', err.message);
    });
}

// URL'nin biletix.com olup olmadığını kontrol et
function isBiletixUrl(url) {
    return url && url.includes('biletix.com');
}

// 1) Tam sayfa yüklemelerinde (normal navigasyon)
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0 && isBiletixUrl(details.url)) {
        console.log('[Biletix Tracker] 🌐 Sayfa yüklendi:', details.url);
        injectContentScript(details.tabId);
    }
}, { url: [{ hostContains: 'biletix.com' }] });

// 2) SPA navigasyonları (pushState / replaceState)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId === 0 && isBiletixUrl(details.url)) {
        console.log('[Biletix Tracker] 🔄 SPA navigasyon:', details.url);
        // Kısa bir gecikme ile inject et (DOM güncellemesi için)
        setTimeout(() => injectContentScript(details.tabId), 500);
    }
}, { url: [{ hostContains: 'biletix.com' }] });

// 3) Tab URL değişimlerini de dinle (yedek mekanizma)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && isBiletixUrl(tab.url)) {
        console.log('[Biletix Tracker] 📌 Tab güncellendi:', tab.url);
        injectContentScript(tabId);
    }
});

// ==========================================
// Alarm-based Periodic Check
// Veri kaybını önlemek için periyodik kontrol
// ==========================================
chrome.alarms.create('periodicCheck', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'periodicCheck') {
        // Aktif biletix sekmelerinde content script'i tetikle
        chrome.tabs.query({ url: '*://*.biletix.com/*' }, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, { action: 'retryExtract' }, () => {
                        // Hata olursa sessizce geç
                        if (chrome.runtime.lastError) { /* ignore */ }
                    });
                }
            });
        });
    }
});
