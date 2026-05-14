// ==========================================
// Biletix Tracker Pro - Popup Controller
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const salesList = document.getElementById('salesList');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const totalSalesEl = document.getElementById('totalSales');
    const todaySalesEl = document.getElementById('todaySales');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalRefundsEl = document.getElementById('totalRefunds');
    const totalCancelsEl = document.getElementById('totalCancels');
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    const statusModal = document.getElementById('statusModal');
    const modalClose = document.getElementById('modalClose');
    const modalRef = document.getElementById('modalRef');
    const deleteModal = document.getElementById('deleteModal');
    const deleteModalRef = document.getElementById('deleteModalRef');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const exportBtn = document.getElementById('exportBtn');
    const endDayBtn = document.getElementById('endDayBtn');
    const resetModal = document.getElementById('resetModal');
    const resetModalCount = document.getElementById('resetModalCount');
    const resetCancelBtn = document.getElementById('resetCancelBtn');
    const resetConfirmBtn = document.getElementById('resetConfirmBtn');

    let allSales = [];
    let activeFilter = 'all';
    let editingRef = null; // Hangi işlem düzenleniyor
    let deletingRef = null; // Hangi işlem siliniyor

    // ==========================================
    // Filter Buttons
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // ==========================================
    // Status Modal
    // ==========================================
    modalClose.addEventListener('click', () => {
        statusModal.classList.remove('show');
    });

    statusModal.addEventListener('click', (e) => {
        if (e.target === statusModal) {
            statusModal.classList.remove('show');
        }
    });

    // Status option buttons
    document.querySelectorAll('.status-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const newStatus = btn.dataset.status;
            if (!editingRef) return;

            // Update the sale in storage
            chrome.storage.local.get('sales', (result) => {
                const sales = result.sales || [];
                const sale = sales.find(s => s.reference === editingRef);
                if (sale) {
                    sale.status = newStatus;
                    chrome.storage.local.set({ sales }, () => {
                        allSales = sales;
                        updateStats();
                        applyFilters();
                        statusModal.classList.remove('show');
                        const statusLabels = { active: 'Aktif', iade: 'İade Edildi', iptal: 'İptal Edildi' };
                        showToast(`✅ Durum güncellendi: ${statusLabels[newStatus]}`);
                    });
                }
            });
        });
    });

    function openStatusModal(sale) {
        editingRef = sale.reference;
        modalRef.textContent = `#${sale.reference}`;

        // Highlight current status
        const currentStatus = sale.status || 'active';
        document.querySelectorAll('.status-option').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.status === currentStatus);
        });

        statusModal.classList.add('show');
    }

    // ==========================================
    // Delete Modal
    // ==========================================
    deleteCancelBtn.addEventListener('click', () => {
        deleteModal.classList.remove('show');
        deletingRef = null;
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove('show');
            deletingRef = null;
        }
    });

    deleteConfirmBtn.addEventListener('click', () => {
        if (!deletingRef) return;
        chrome.storage.local.get('sales', (result) => {
            let sales = result.sales || [];
            sales = sales.filter(s => s.reference !== deletingRef);
            chrome.storage.local.set({ sales }, () => {
                allSales = sales;
                updateStats();
                applyFilters();
                deleteModal.classList.remove('show');
                showToast('🗑️ İşlem silindi');
                deletingRef = null;
            });
        });
    });

    function openDeleteModal(sale) {
        deletingRef = sale.reference;
        deleteModalRef.textContent = `#${sale.reference}`;
        deleteModal.classList.add('show');
    }

    // ==========================================
    // End Day (Reset All)
    // ==========================================
    endDayBtn.addEventListener('click', () => {
        if (allSales.length === 0) {
            showToast('⚠️ Sıfırlanacak kayıt yok!');
            return;
        }
        resetModalCount.textContent = `${allSales.length} işlem silinecek`;
        resetModal.classList.add('show');
    });

    resetCancelBtn.addEventListener('click', () => {
        resetModal.classList.remove('show');
    });

    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) {
            resetModal.classList.remove('show');
        }
    });

    resetConfirmBtn.addEventListener('click', () => {
        chrome.storage.local.set({ sales: [] }, () => {
            allSales = [];
            updateStats();
            applyFilters();
            resetModal.classList.remove('show');
            showToast('✅ Gün kapatıldı, tüm kayıtlar silindi!');
        });
    });

    // ==========================================
    // CSV Export
    // ==========================================
    exportBtn.addEventListener('click', () => {
        if (allSales.length === 0) {
            showToast('⚠️ Dışa aktaracak işlem yok!');
            return;
        }
        exportToCSV();
        exportBtn.classList.add('success');
        showToast('📥 CSV dosyası indirildi!');
        setTimeout(() => exportBtn.classList.remove('success'), 2000);
    });

    function exportToCSV() {
        const headers = ['Referans', 'Müşteri Adı', 'Telefon', 'Etkinlik', 'Ödeme Yöntemi', 'Tutar', 'Taksit', 'Durum', 'Tarih'];
        const statusLabels = { active: 'Aktif', iade: 'İade', iptal: 'İptal' };

        const rows = allSales.map(s => [
            s.reference || '',
            s.customerName || '',
            s.customerPhone || '',
            s.eventName || '',
            s.paymentMethod || '',
            s.totalPrice || '',
            s.installment || '',
            statusLabels[s.status] || 'Aktif',
            s.date ? new Date(s.date).toLocaleString('tr-TR') : ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        // BOM for UTF-8 Turkish character support
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `biletix-islemler-${dateStr}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // ==========================================
    // Reload Button
    // ==========================================
    const reloadBtn = document.getElementById('reloadBtn');
    reloadBtn.addEventListener('click', () => {
        reloadBtn.classList.remove('success', 'error');
        reloadBtn.classList.add('spinning');
        reloadBtn.disabled = true;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab || !tab.url || !tab.url.includes('biletix.com')) {
                reloadBtn.classList.remove('spinning');
                reloadBtn.classList.add('error');
                reloadBtn.disabled = false;
                showToast('❌ Aktif sekme Biletix değil!');
                setTimeout(() => reloadBtn.classList.remove('error'), 2000);
                return;
            }

            chrome.tabs.sendMessage(tab.id, { action: 'retryExtract' }, (response) => {
                reloadBtn.classList.remove('spinning');
                reloadBtn.disabled = false;

                if (chrome.runtime.lastError) {
                    reloadBtn.classList.add('error');
                    showToast('⚠️ Sayfayla bağlantı kurulamadı. Sayfayı yenileyin.');
                    setTimeout(() => reloadBtn.classList.remove('error'), 2000);
                    return;
                }

                if (response && response.success) {
                    reloadBtn.classList.add('success');
                    showToast('✅ İşlem başarıyla çekildi!');
                    loadSales();
                    setTimeout(() => reloadBtn.classList.remove('success'), 2000);
                } else {
                    reloadBtn.classList.add('error');
                    showToast('⚠️ ' + (response?.reason || 'Veri çekilemedi.'));
                    setTimeout(() => reloadBtn.classList.remove('error'), 2000);
                }
            });
        });
    });

    // ==========================================
    // Data Functions
    // ==========================================
    function loadSales() {
        chrome.storage.local.get('sales', (result) => {
            allSales = result.sales || [];
            updateStats();
            applyFilters();
        });
    }

    function updateStats() {
        const activeSales = allSales.filter(s => !s.status || s.status === 'active');
        const total = allSales.length;
        const today = getTodayCount();
        const revenue = getTotalRevenue(activeSales);
        const refunds = allSales.filter(s => s.status === 'iade').length;
        const cancels = allSales.filter(s => s.status === 'iptal').length;

        totalSalesEl.textContent = total;
        todaySalesEl.textContent = today;
        totalRevenueEl.textContent = formatCurrency(revenue);
        totalRefundsEl.textContent = refunds;
        totalCancelsEl.textContent = cancels;
    }

    function getTodayCount() {
        const todayStr = new Date().toISOString().split('T')[0];
        return allSales.filter(s => s.date && s.date.startsWith(todayStr)).length;
    }

    function getTotalRevenue(sales) {
        return (sales || allSales).reduce((sum, s) => {
            if (s.status === 'iade' || s.status === 'iptal') return sum;
            const price = parsePrice(s.totalPrice);
            return sum + price;
        }, 0);
    }

    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^\d,.]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }

    function formatCurrency(amount) {
        if (amount >= 1000) {
            return '₺' + (amount / 1000).toFixed(1) + 'K';
        }
        return '₺' + amount.toFixed(0);
    }

    // ==========================================
    // Filter & Search
    // ==========================================
    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();
        let filtered = [...allSales];

        // Apply status/payment filter
        if (activeFilter === 'nakit') {
            filtered = filtered.filter(s => {
                const method = (s.paymentMethod || '').toLowerCase();
                return method.includes('nakit') || method.includes('cash');
            });
        } else if (activeFilter === 'pos') {
            filtered = filtered.filter(s => {
                const method = (s.paymentMethod || '').toLowerCase();
                return method.includes('kart') || method.includes('kredi') || method.includes('pos') || method.includes('card') || method.includes('visa') || method.includes('master');
            });
        } else if (activeFilter === 'iade') {
            filtered = filtered.filter(s => s.status === 'iade');
        } else if (activeFilter === 'iptal') {
            filtered = filtered.filter(s => s.status === 'iptal');
        }

        // Apply search query
        if (query) {
            filtered = filtered.filter(sale => {
                const ref = (sale.reference || '').toLowerCase();
                const name = (sale.customerName || '').toLowerCase();
                const event = (sale.eventName || '').toLowerCase();
                const phone = (sale.customerPhone || '').toLowerCase();
                const email = (sale.customerEmail || '').toLowerCase();
                const price = (sale.totalPrice || '').toLowerCase();
                const priceNum = parsePrice(sale.totalPrice).toString();
                return ref.includes(query) || name.includes(query) || event.includes(query) || phone.includes(query) || email.includes(query) || price.includes(query) || priceNum.includes(query);
            });
        }

        renderSales(filtered);
    }

    searchInput.addEventListener('input', () => {
        applyFilters();
    });

    // ==========================================
    // Render
    // ==========================================
    function renderSales(sales) {
        const cards = salesList.querySelectorAll('.sale-card');
        cards.forEach(card => card.remove());

        const displaySales = sales.slice(-50).reverse();

        if (displaySales.length === 0) {
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';

        displaySales.forEach((sale, index) => {
            const card = createSaleCard(sale, index);
            salesList.appendChild(card);
        });
    }

    function createSaleCard(sale, index) {
        const card = document.createElement('div');
        card.className = 'sale-card';
        card.style.animationDelay = `${index * 0.02}s`;

        const status = sale.status || 'active';
        if (status === 'iade') {
            card.classList.add('sale-card-refund');
        } else if (status === 'iptal') {
            card.classList.add('sale-card-cancel');
        }

        const ref = sale.reference || 'N/A';
        const event = sale.eventName || '';
        const customer = sale.customerName || 'Müşteri';
        const maskedCustomer = maskName(customer);
        const phone = sale.customerPhone || '';
        const maskedPhone = maskPhone(phone);
        const price = sale.totalPrice || '₺0';
        const paymentMethod = sale.paymentMethod || '';
        const installment = sale.installment || '';
        const date = formatDate(sale.date);

        // Status badge
        let statusBadge = '';
        if (status === 'iade') {
            statusBadge = '<span class="sale-status-badge badge-refund">↩️ İade</span>';
        } else if (status === 'iptal') {
            statusBadge = '<span class="sale-status-badge badge-cancel">❌ İptal</span>';
        }

        let detailsHtml = '';
        if (event) {
            detailsHtml += `<div class="sale-event">${escapeHtml(event)}</div>`;
        }

        card.innerHTML = `
      <div class="sale-card-header">
        <span class="sale-ref" data-ref="${escapeHtml(ref)}" title="Tıkla & Kopyala">
          <svg class="sale-ref-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
          </svg>
          #${escapeHtml(ref)}
        </span>
        <div class="sale-card-right">
          ${statusBadge}
          <span class="sale-price ${status !== 'active' ? 'price-muted' : ''}">${escapeHtml(price)}</span>
        </div>
      </div>
      ${detailsHtml}
      <div class="sale-info-row">
        <span class="sale-customer">👤 ${escapeHtml(maskedCustomer)}</span>
        ${phone ? `<span class="sale-phone">📱 ${escapeHtml(maskedPhone)}</span>` : ''}
      </div>
      <div class="sale-details">
        ${paymentMethod ? `<span class="sale-payment">💳 ${escapeHtml(paymentMethod)}${installment ? ' · ' + escapeHtml(installment) : ''}</span>` : ''}
        <span class="sale-date">${date}</span>
      </div>
      <button class="sale-delete-btn" title="İşlemi sil">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
      <button class="sale-status-btn" title="Durumu değiştir">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>
    `;

        // Click to copy reference
        const refEl = card.querySelector('.sale-ref');
        refEl.addEventListener('click', () => {
            copyToClipboard(ref);
        });

        // Delete button
        const deleteBtn = card.querySelector('.sale-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteModal(sale);
        });

        // Status change button
        const statusBtn = card.querySelector('.sale-status-btn');
        statusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openStatusModal(sale);
        });

        return card;
    }

    // ==========================================
    // Utilities
    // ==========================================
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Kopyalandı!');
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('Kopyalandı!');
        });
    }

    function showToast(message) {
        toastText.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            const options = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
            return d.toLocaleDateString('tr-TR', options);
        } catch {
            return dateStr;
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // İsmi maskele: "Arda Geçimli" → "A**** G******"
    function maskName(name) {
        if (!name || name === 'Müşteri') return name;
        return name.split(' ').map(word => {
            if (word.length <= 1) return word;
            return word.charAt(0) + '*'.repeat(word.length - 1);
        }).join(' ');
    }

    // Telefonu maskele: "05551234567" → "*******4567"
    function maskPhone(phone) {
        if (!phone) return phone;
        const digits = phone.replace(/\D/g, '');
        if (digits.length <= 4) return phone;
        const lastFour = digits.slice(-4);
        const maskedPart = '*'.repeat(digits.length - 4);
        return maskedPart + lastFour;
    }

    // ==========================================
    // Real-time Updates
    // ==========================================
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.sales) {
            allSales = changes.sales.newValue || [];
            updateStats();
            applyFilters();
        }
    });

    // Init
    loadSales();
});
