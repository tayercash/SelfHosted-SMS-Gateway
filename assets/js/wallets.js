$(document).ready(function () {
    let currentUserRole = 'user';
    window.isAdmin = false;
    let sortAsc = false;

    function formatCurrency(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return '$0.00';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
    }

    function parseCurrencyText(value) {
        if (value == null) return 0;
        const numeric = value.toString().replace(/[^0-9.-]+/g, '');
        const parsed = parseFloat(numeric);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new Blob([u8arr], { type: mime });
    }

    function updateTotalBalance() {
        const total = $('#wallets_container .visa-card').toArray().reduce((sum, card) => {
            return sum + parseCurrencyText($(card).find('.wallet_balance').text());
        }, 0);
        $('#wallets_total_balance').text(formatCurrency(total));
    }

    async function loadCurrentUserRole() {
        try {
            const response = await fetch('/api/me');
            if (!response.ok) return;
            const data = await response.json();
            currentUserRole = data.role || 'user';
            window.isAdmin = currentUserRole === 'admin';
            loadAdjustments();
            fetchWallets();
        } catch (err) {
            console.warn('Unable to load user role:', err);
        }
    }

    function loadAdjustments() {
        $.get('/get_adjustments', function (res) {
            if (res.success) {
                $('.adjustment_select').each(function () {
                    const select = $(this);
                    select.find('option:not(:first)').remove();
                    res.data.forEach(adj => {
                        select.append(`<option value="${adj.id}">${adj.name} (${adj.percentage}%)</option>`);
                    });
                });
            }
        });
    }

    async function loadMerchantsIntoSelect(selectId) {
        try {
            const response = await fetch('/get_merchants');
            const result = await response.json();
            if (result.success) {
                const select = $(selectId);
                const currentVal = select.val();
                select.empty().append(`<option value="">${t('wallets.no_merchant')}</option>`);
                result.data.forEach(m => {
                    select.append(`<option value="${m.id}">${m.name} (${t('wallets.balance')}: $${m.balance})</option>`);
                });
                if (currentVal) select.val(currentVal);
                if (window.updateCustomSelect) {
                    window.updateCustomSelect(select);
                }
            }
        } catch (err) {
            console.error('Error loading merchants:', err);
        }
    }

    function createCardHtml(card) {
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        const providerLogo = card.walletProvider ? `assets/images/wallets_providers/${card.walletProvider.toLowerCase()}.png` : null;
        const nameEmpty = !card.name || card.name.trim() === '';
        const incompleteBadge = nameEmpty ? '<span class="wallet-incomplete-badge" onclick="event.stopPropagation();document.querySelector(\'#card_' + card.id + ' .wallet_edit\').click();" style="display:inline-flex;align-items:center;gap:4px;margin-inline-start:6px;padding:2px 8px;border-radius:6px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#ef4444;font-size:0.65rem;font-weight:600;white-space:nowrap;cursor:pointer;" title="' + (t('wallets.incomplete_info') || 'بيانات غير مكتملة - أضف اسم المحفظة') + '"><i class="fas fa-exclamation-triangle" style="font-size:0.6rem;"></i>' + (t('wallets.incomplete') || 'غير مكتمل') + '</span>' : '';

        return `<div class="visa-card wallet-card${nameEmpty ? ' wallet-incomplete' : ''}" id="card_${card.id}">
            <div class="card-header">
                <div class="Name">${card.name || '-'}${incompleteBadge}</div>
                <span class="chip">
                    <span class="action wallet_transaction" data-id="${card.id}"><i class="fas fa-money-bill-wave"></i></span>
                </span>
            </div>
            <div class="card-number">
                <span class="wallet-num-text">${card.WalletNum ? card.WalletNum.trim() : 'N/A'}</span>
                <span class="action copy-wallet-num" title="${t('wallets.copy_number')}"><i class="fas fa-copy"></i></span>
            </div>
            <div class="card-details-grid">
                <div class="detail-item">
                    <span class="label">${t('wallets.monthly_limit')}</span>
                    <span class="value wallet_monthly_limit">${formatter.format(card.remaining_monthly_limit || 0)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">${t('wallets.daily_limit')}</span>
                    <span class="value wallet_daily_limit">${formatter.format(card.remaining_daily_limit || 0)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">${t('wallets.merchant')}</span>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span class="value wallet_merchant_link" data-merchant-id="${card.merchant_id}" style="color: #fff; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85px; cursor: pointer;">
                            ${card.merchant_name || t('wallets.available')}
                        </span>
                        <span class="action wallet_edit_merchant" data-id="${card.id}" data-merchant-id="${card.merchant_id}" style="font-size: 10px; cursor: pointer; opacity: 0.6;"><i class="fas fa-edit"></i></span>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="label">${t('wallets.balance')}</span>
                    <span class="value wallet_balance">${formatter.format(card.balance)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">${t('wallets.provider')}</span>
                    <span class="value">${providerLogo ? `<img src="${providerLogo}" alt="${card.walletProvider}" style="height: 20px; vertical-align: middle;">` : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">${t('wallets.actions')}</span>
                    <div class="visa_actions">
                        ${window.isAdmin ? `<span class="action wallet_edit" data-id="${card.id}"><i class="fas fa-edit"></i></span>` : ''}
                        ${window.isAdmin ? `<span class="action wallet_delete" data-id="${card.id}" data-name="${card.name || ''}" data-num="${card.WalletNum || ''}" style="color:#ef4444;"><i class="fas fa-trash"></i></span>` : ''}
                        <span class="action wallet_add_balance" data-id="${card.id}"><i class="fas fa-plus-circle"></i></span>
                        <span class="action wallet_view_transactions" data-id="${card.id}"><i class="fas fa-list"></i></span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function fetchWallets(filter) {
        if (!filter) filter = 'all';
        $.ajax({
            url: '/get_wallets',
            type: 'GET',
            data: { filter: filter },
            success: function (response) {
                if (response.success) {
                    const container = $('#wallets_container');
                    container.empty();
                    response.data.forEach(card => {
                        container.append(createCardHtml(card));
                    });
                    updateTotalBalance();
                }
            },
            error: function () {
                console.error('Error loading wallets');
            }
        });
    }

    function updateCardDisplay(card) {
        const existingCard = $(`#card_${card.id}`);
        if (existingCard.length) {
            existingCard.replaceWith(createCardHtml(card));
        } else {
            $('#wallets_container').append(createCardHtml(card));
        }
        updateTotalBalance();
    }

    function updateCardBalance(cardId, newBalance, transactionType, newDailyRemaining, newMonthlyRemaining) {
        const cardElement = $(`#card_${cardId}`);
        if (cardElement.length) {
            const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
            cardElement.find('.wallet_balance').text(formatter.format(newBalance));
            if (newDailyRemaining !== undefined) {
                cardElement.find('.wallet_daily_limit').text(formatter.format(newDailyRemaining));
            }
            if (newMonthlyRemaining !== undefined) {
                cardElement.find('.wallet_monthly_limit').text(formatter.format(newMonthlyRemaining));
            }
            updateTotalBalance();
        }
    }

    function copyWalletNumber(text, btn) {
        const originalHTML = btn.innerHTML;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                btn.innerHTML = `${t('common.copied')} <i class="fas fa-check" style="font-size:12px"></i>`;
                btn.classList.add('copied');
                setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('copied'); }, 2000);
            }).catch(() => fallbackCopy(text, btn, originalHTML));
        } else {
            fallbackCopy(text, btn, originalHTML);
        }
    }

    function fallbackCopy(text, btn, originalHTML) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            btn.innerHTML = `${t('common.copied')} <i class="fas fa-check" style="font-size:12px"></i>`;
            btn.classList.add('copied');
            setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('copied'); }, 2000);
        } catch (err) { console.error('Copy failed:', err); }
        document.body.removeChild(textArea);
    }

    function executeWalletSort() {
        const criteria = $('#wallets_sort_criteria').val();
        const container = $('#wallets_container');
        const cards = container.children('.visa-card').get();
        const btn = $('#wallets_sort_btn');
        if (!criteria) return;
        cards.sort(function (a, b) {
            let valA = $(a).find(criteria).text().replace(/[^\d.-]/g, '');
            let valB = $(b).find(criteria).text().replace(/[^\d.-]/g, '');
            valA = parseFloat(valA) || 0;
            valB = parseFloat(valB) || 0;
            return sortAsc ? valA - valB : valB - valA;
        });
        const icon = sortAsc ? 'fa-sort-amount-up-alt' : 'fa-sort-amount-down';
        btn.find('i').attr('class', 'fas ' + icon);
        container.empty().append(cards);
    }

    // Socket listeners
    function setupWalletSocketListeners() {
        if (!window.socket) {
            setTimeout(setupWalletSocketListeners, 1000);
            return;
        }
        window.socket.off('wallet_updated');
        window.socket.on('wallet_updated', function (wallet) {
            if (wallet && wallet.id) updateCardDisplay(wallet);
            else fetchWallets();
        });
        window.socket.off('wallet_deleted');
        window.socket.on('wallet_deleted', function (data) {
            if (data && data.id) {
                var el = document.getElementById('card_' + data.id);
                if (el) el.remove();
                updateTotalBalance();
            }
        });
        window.socket.off('wallet_transaction_added');
        window.socket.on('wallet_transaction_added', function (data) {
            if (data.transaction && data.transaction.card_id) {
                updateCardBalance(data.transaction.card_id, data.new_balance, data.transaction.transaction_type, data.new_daily_remaining, data.new_monthly_remaining);
            }
        });
        window.socket.off('wallet_transaction_deleted');
        window.socket.on('wallet_transaction_deleted', function (data) {
            var el = document.querySelector('[data-tx-id="' + data.id + '"]');
            if (el) el.remove();
            var cardEl = document.getElementById('card_' + data.card_id);
            if (cardEl) {
                var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
                if (data.new_daily_remaining !== undefined) {
                    var dailyEl = cardEl.querySelector('.wallet_daily_limit');
                    if (dailyEl) dailyEl.textContent = formatter.format(data.new_daily_remaining);
                }
                if (data.new_monthly_remaining !== undefined) {
                    var monthlyEl = cardEl.querySelector('.wallet_monthly_limit');
                    if (monthlyEl) monthlyEl.textContent = formatter.format(data.new_monthly_remaining);
                }
            }
        });
        window.socket.off('adjustments_updated');
        window.socket.on('adjustments_updated', function () { loadAdjustments(); });
        window.socket.off('merchant_updated');
        window.socket.on('merchant_updated', function () { loadMerchantsIntoSelect('#wallet_merchant_select'); });
        window.socket.off('reconnect');
        window.socket.on('reconnect', function () { fetchWallets(); });

        $(document).off('page_shown.wallets');
        $(document).on('page_shown.wallets', function (e, url) {
            if (url && url.indexOf('wallets') !== -1) {
                fetchWallets($('#wallets_filter').val());
            }
        });
    }

    // ========== Event Handlers ==========

    $(document).on('click', '.copy-wallet-num', function () {
        const num = $(this).closest('.card-number').find('.wallet-num-text').text().trim();
        copyWalletNumber(num, this);
    });

    $('#wallets_sort_btn').on('click', function () {
        sortAsc = !sortAsc;
        executeWalletSort();
    });

    $('#wallets_sort_criteria').on('change', function () {
        executeWalletSort();
    });

    $('#wallets_filter').on('change', function () {
        fetchWallets($(this).val());
    });

    $('#wallets_search_btn').on('click', function () {
        const searchContainer = $('#wallets_search_container');
        if (searchContainer.is(':hidden')) {
            searchContainer.slideDown(200, function () { $('#wallets_search_input').focus(); });
        } else {
            searchContainer.slideUp(200);
        }
    });

    $('#wallets_close_search').on('click', function () {
        $('#wallets_search_container').slideUp(200);
        $('#wallets_search_input').val('').trigger('keyup');
    });

    $('#wallets_search_input').on('keyup', function () {
        const value = $(this).val().toLowerCase().trim();
        const cards = $("#wallets_container .wallet-card");
        if (value === "") { cards.show(); return; }
        cards.each(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    // Add wallet button
    $('.add_wallet_btn').on('click', function () {
        $('#wallets_data_form')[0].reset();
        $('#wallets_data_form input[name="id"]').val('');
        $('#wallet_balance_input').closest('.form-group').show();
        loadMerchantsIntoSelect('#wallet_merchant_select');
        $('#wallets_data_popup').openpopup();
    });

    // Edit wallet
    $(document).on('click', '.visa_actions .action.wallet_edit', function () {
        const cardId = $(this).data('id');
        $.ajax({
            url: '/get_wallet_details/' + cardId,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const card = response.data;
                    const form = $("#wallets_data_form");
                    form.find("input[name='id']").val(card.id);
                    form.find("input[name='name']").val(card.name);
                    form.find("input[name='WalletNum']").val(card.WalletNum);
                    form.find("select[name='walletProvider']").val(card.walletProvider ? card.walletProvider.charAt(0).toUpperCase() + card.walletProvider.slice(1) : "").trigger('change');
                    form.find("input[name='Monthly_limit']").val(card.Monthly_limit);
                    form.find("input[name='daily_limit']").val(card.daily_limit);
                    form.find("textarea[name='note']").val(card.note);
                    form.find("input[name='balance']").val(card.balance);
                    $('#wallet_balance_input').closest('.form-group').show();
                    loadMerchantsIntoSelect('#wallet_merchant_select').then(function () {
                        form.find("select[name='merchant_id']").val(card.merchant_id || "").trigger('change');
                    });
                    $("#wallets_data_popup").openpopup();
                }
            },
            error: function () { showToast(t('wallets.error_load'), 'error'); }
        });
    });

    // Delete wallet
    $(document).on('click', '.visa_actions .action.wallet_delete', function () {
        var cardId = $(this).data('id');
        var cardName = $(this).data('name');
        var cardNum = $(this).data('num');
        document.getElementById('at-del-wallet-id').value = cardId;
        document.getElementById('at-del-wallet-name').textContent = cardName + ' (' + cardNum + ')';
        document.getElementById('at-del-wallet-result').textContent = '';
        $('#at-del-wallet-popup').openpopup();
    });

    window.at_doDeleteWallet = function (mode) {
        var id = document.getElementById('at-del-wallet-id').value;
        var endpoint = mode === 'hard' ? '/delete_wallet_hard' : '/delete_wallet';
        var resultEl = document.getElementById('at-del-wallet-result');

        $.ajax({
            url: endpoint,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: parseInt(id) }),
            success: function (response) {
                if (response.success) {
                    $('#at-del-wallet-popup').closepopup();
                    var el = document.getElementById('card_' + id);
                    if (el) el.remove();
                } else {
                    resultEl.textContent = response.error || t('wallets.delete_failed');
                    resultEl.style.color = '#ef4444';
                }
            },
            error: function (xhr) {
                var err = xhr.responseJSON;
                resultEl.textContent = err ? err.error : t('wallets.delete_failed');
                resultEl.style.color = '#ef4444';
            }
        });
    }

    window.wallet_deleteTx = function (txId) {
        $('#del-tx-id').val(txId);
        $('#del-tx-confirm-popup').openpopup();
    };

    $('#del-tx-confirm-yes').on('click', function () {
        var txId = $('#del-tx-id').val();
        if (!txId) return;
        $.ajax({
            url: '/delete_wallet_transaction',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: parseInt(txId) }),
            success: function (res) {
                if (res.success) {
                    var el = document.querySelector('[data-tx-id="' + txId + '"]');
                    if (el) el.remove();
                    $('#del-tx-confirm-popup').closepopup();
                    showToast('✅ ' + (res.message || 'تم الحذف'), 'success');
                } else {
                    showToast('❌ ' + (res.error || 'فشل الحذف'), 'error');
                }
            },
            error: function (xhr) {
                var err = xhr.responseJSON;
                showToast('❌ ' + (err ? err.error : 'فشل الحذف'), 'error');
            }
        });
    });

    // Save wallet form
    $('#wallets_data_form').on('submit', function (e) {
        e.preventDefault();
        const form = $(this);
        const walletId = form.find("input[name='id']").val();
        const newBalance = parseFloat(form.find("input[name='balance']").val());
        const formData = form.serialize();

        function afterSave() {
            if (walletId && !isNaN(newBalance)) {
                $.ajax({
                    url: '/edit_wallet_balance',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ card_id: parseInt(walletId), new_balance: newBalance }),
                    success: function () {},
                    error: function (xhr) {
                        const err = xhr.responseJSON;
                        showToast('❌ ' + (err ? err.error : t('wallets.error_save')), 'error');
                    }
                });
            }
        }

        $.ajax({
            url: '/savewallet',
            type: 'POST',
            data: formData,
            success: function (response) {
                if (response.success) {
                    afterSave();
                    showToast('✅ ' + response.message, 'success');
                    $('#wallets_data_popup').closepopup();
                }
            },
            error: function (xhr) {
                const err = xhr.responseJSON;
                showToast('❌ ' + (err ? err.error : t('wallets.error_save')), 'error');
            }
        });
    });

    // Transaction popup
    $(document).on('click', '.wallet_transaction', function () {
        const cardId = $(this).data('id');
        $('#wallets_transaction_form')[0].reset();
        $('#wallets_transaction_form input[name="card_id"]').val(cardId);
        $('#wallets_transaction_popup').openpopup();
    });

    // Transaction form submit
    $('#wallets_transaction_form').on('submit', function (e) {
        e.preventDefault();
        var data = {
            card_id: $(this).find('input[name="card_id"]').val(),
            price: $(this).find('input[name="price"]').val(),
            note: $(this).find('textarea[name="note"]').val()
        };
        $.ajax({
            url: '/wallet_transaction',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    showToast('✅ ' + response.message, 'success');
                    $('#wallets_transaction_popup').closepopup();
                }
            },
            error: function (xhr) {
                const err = xhr.responseJSON;
                showToast('❌ ' + (err ? err.error : t('wallets.error_transaction')), 'error');
            }
        });
    });

    // Add balance popup
    $(document).on('click', '.wallet_add_balance', function () {
        const cardId = $(this).data('id');
        $('#wallets_balance_form')[0].reset();
        $('#wallets_balance_form input[name="card_id"]').val(cardId);
        $('#wallets_balance_popup').openpopup();
    });

    // Add balance form submit
    $('#wallets_balance_form').on('submit', function (e) {
        e.preventDefault();
        var data = {
            card_id: $(this).find('input[name="card_id"]').val(),
            amount: $(this).find('input[name="amount"]').val(),
            note: $(this).find('textarea[name="note"]').val()
        };
        $.ajax({
            url: '/add_wallet_balance',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    showToast('✅ ' + response.message, 'success');
                    $('#wallets_balance_popup').closepopup();
                }
            },
            error: function (xhr) {
                const err = xhr.responseJSON;
                showToast('❌ ' + (err ? err.error : t('wallets.error_add_balance')), 'error');
            }
        });
    });

    // View transactions
    $(document).on('click', '.wallet_view_transactions', function () {
        const cardId = $(this).data('id');
        $('#wallets_transactions_popup').data('card-id', cardId);
        $.ajax({
            url: '/get_wallet_transactions/' + cardId,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const container = $('#wallets_transactions_list');
                    container.empty();
                    if (response.data.length === 0) {
                        container.append(`<p style="text-align: center; color: #666;">${t('wallets.no_operations')}</p>`);
                    } else {
                        response.data.forEach(function (tx) {
                            const isAdd = tx.transaction_type === 'add_money';
                            const cls = isAdd ? 'positive' : 'negative';
                            const sign = isAdd ? '+' : '-';
                            const typeLabel = isAdd ? t('wallets.deposit') : t('wallets.pay');
                            const date = tx.created_at ? new Date(tx.created_at).toLocaleString() : '';
                            const noteHtml = tx.note ? '<span><i class="fas fa-comment" style="opacity:0.5;"></i> ' + tx.note + '</span>' : '';
                            container.append(`
                                <div class="transaction-item" data-tx-id="${tx.id}">
                                    <div class="t-details">
                                        <div class="t-main">
                                            <span class="transaction-amount ${cls}">${sign}${formatCurrency(tx.price)}</span>
                                            <div style="display:flex;align-items:center;gap:8px;">
                                                <span class="t-type-badge ${cls}">${typeLabel}</span>
                                                <button class="tx-delete-btn" onclick="wallet_deleteTx(${tx.id})" title="${t('common.delete') || 'حذف'}"><i class="fas fa-trash-alt"></i></button>
                                            </div>
                                        </div>
                                        <div class="t-info">
                                            <span><i class="fas fa-user" style="opacity:0.5;"></i> ${tx.username || 'system'}</span>
                                            <span><i class="fas fa-clock" style="opacity:0.5;"></i> ${date}</span>
                                            ${noteHtml}
                                        </div>
                                    </div>
                                </div>
                            `);
                        });
                    }
                    $('#wallets_transactions_popup').openpopup();
                }
            },
            error: function () { showToast(t('wallets.error_load_ops'), 'error'); }
        });
    });

    // Edit merchant from wallet card
    $(document).on('click', '.wallet_edit_merchant', function () {
        const walletId = $(this).data('id');
        const currentMerchantId = $(this).data('merchant-id');
        $('#change_wallet_merchant_form input[name="wallet_id"]').val(walletId);
        $('#selected_merchant_id_input').val(currentMerchantId || "");
        $.ajax({
            url: '/get_merchants',
            type: 'GET',
            success: function (result) {
                if (result.success) {
                    const listContainer = $('#quick_merchants_list');
                    listContainer.empty();
                    listContainer.append(`
                        <div class="merchant-option-item ${!currentMerchantId ? 'selected' : ''}" data-id="">
                            <div class="m-info">
                                <span class="m-name">${t('wallets.no_merchant')}</span>
                                <span class="m-balance">${t('common.cancel')}</span>
                            </div>
                            <div class="m-check"><i class="fas fa-check-circle"></i></div>
                        </div>
                    `);
                    result.data.forEach(function (m) {
                        const isSelected = m.id == currentMerchantId;
                        listContainer.append(`
                            <div class="merchant-option-item ${isSelected ? 'selected' : ''}" data-id="${m.id}">
                                <div class="m-info">
                                    <span class="m-name">${m.name}</span>
                                    <span class="m-balance">${t('wallets.balance')}: $${m.balance}</span>
                                </div>
                                <div class="m-check"><i class="fas fa-check-circle"></i></div>
                            </div>
                        `);
                    });
                    $("#change_wallet_merchant_popup").openpopup();
                }
            },
            error: function () { showToast(t('merchants.load_error'), 'error'); }
        });
    });

    // Merchant selection from list
    $(document).on('click', '.merchant-option-item', function () {
        const merchantId = $(this).data('id');
        $('#selected_merchant_id_input').val(merchantId);
        $('.merchant-option-item').removeClass('selected');
        $(this).addClass('selected');
    });

    // Submit change merchant form
    $('#change_wallet_merchant_form').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/update_wallet_merchant',
            type: 'POST',
            data: $(this).serialize(),
            success: function (response) {
                if (response.success) {
                    showToast('✅ ' + response.message, 'success');
                    $("#change_wallet_merchant_popup").closepopup();
                }
            },
            error: function (xhr) {
                const err = xhr.responseJSON;
                showToast('❌ ' + (err ? err.error : t('admin.toast_update_failed')), 'error');
            }
        });
    });

    // View merchant details from wallet
    $(document).on('click', '.wallet_merchant_link', function () {
        const merchantId = $(this).data('merchant-id');
        if (!merchantId) return;
        $.ajax({
            url: '/get_merchant_details/' + merchantId,
            type: 'GET',
            success: function (merchantRes) {
                if (merchantRes.success) {
                    const merchant = merchantRes.data;
                    $('#merchant_summary_card_container').html(`
                        <div class="visa-card merchant-card" style="margin: 0; width: 100%; box-sizing: border-box;">
                            <div class="card-header"><div class="Name" style="color: #fff;">${merchant.name}</div></div>
                            <div class="card-details-grid">
                                <div class="detail-item"><span class="label">${t('wallets.balance')}</span><span class="value merchant_balance">${formatCurrency(merchant.balance || 0)}</span></div>
                                <div class="detail-item"><span class="label">${t('wallets.net_balance')}</span><span class="value merchant_net_balance" style="color: #00ffcc; font-weight: bold;">${formatCurrency((merchant.balance || 0) * 0.99)}</span></div>
                                <div class="detail-item"><span class="label">${t('merchants.linked_wallets')}</span><span class="value">${merchant.linked_wallets_count || 0}</span></div>
                                <div class="detail-item"><span class="label">${t('wallets.notes')}</span><span class="value">${merchant.note || '-'}</span></div>
                            </div>
                        </div>
                    `);
                    $.ajax({
                        url: '/get_merchant_transactions/' + merchantId,
                        type: 'GET',
                        success: function (transRes) {
                            if (transRes.success) {
                                const container = $('#merchant_transactions_from_wallet_list');
                                container.empty();
                                if (transRes.data.length === 0) {
                                    container.append(`<p style="text-align: center; color: #666;">${t('wallets.no_operations')}</p>`);
                                } else {
                                    transRes.data.forEach(function (tx) {
                                        const isPositive = tx.amount >= 0;
                                        const cls = isPositive ? 'positive' : 'negative';
                                        const sign = isPositive ? '+' : '';
                                        const typeName = tx.transaction_type === 'wallet_sync' ? t('merchants.system_wallet') : t('merchants.manual');
                                        const date = tx.created_at ? new Date(tx.created_at).toLocaleString() : '';
                                        container.append(`
                                            <div class="transaction-item">
                                                <div class="t-details">
                                                    <div class="t-main">
                                                        <span class="transaction-amount ${cls}">${sign}${formatCurrency(tx.amount)}</span>
                                                        <span class="t-type-badge ${cls}">${typeName}</span>
                                                    </div>
                                                    <div class="t-info">
                                                        <span><i class="fas fa-user" style="opacity:0.5;"></i> ${tx.username || 'system'}</span>
                                                        <span><i class="fas fa-clock" style="opacity:0.5;"></i> ${date}</span>
                                                        ${tx.note ? '<span><i class="fas fa-comment" style="opacity:0.5;"></i> ' + tx.note + '</span>' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        `);
                                    });
                                }
                            }
                        }
                    });
                    $("#merchant_details_from_wallet_popup").openpopup();
                }
            }
        });
    });

    // ========== Camera Controls ==========
    function setupCameraControls(openBtnId, chooseBtnId, retakeBtnId, fileInputId, dataFieldId, previewId) {
        $(document).off('click', openBtnId).on('click', openBtnId, function () {
            if (window.cameraManager && typeof window.cameraManager.captureImage === 'function') {
                window.cameraManager.captureImage(function (dataUrl) {
                    $(dataFieldId).val(dataUrl);
                    $(previewId).html(`<img src="${dataUrl}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;">`);
                    $(openBtnId).html('🔄 إعادة التصوير');
                });
            }
        });
        $(document).off('click', chooseBtnId).on('click', chooseBtnId, function () {
            $(fileInputId).click();
        });
        $(document).off('change', fileInputId).on('change', fileInputId, function () {
            const file = this.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { showToast(t('wallets.select_image'), 'error'); this.value = ''; return; }
            if (file.size > 5 * 1024 * 1024) { showToast(t('wallets.file_too_large'), 'error'); this.value = ''; return; }
            const reader = new FileReader();
            reader.onload = function (e) {
                $(dataFieldId).val(e.target.result);
                $(previewId).html(`<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;">`);
            };
            reader.readAsDataURL(file);
        });
    }

    // ========== Merchant Popups ==========
    $(document).on('click', '.wallet_merchant_edit', function () {
        const id = $(this).data('id');
        $.get('/get_merchant_details/' + id, function (res) {
            if (res.success) {
                const m = res.data;
                $('#merchants_data_form input[name="id"]').val(m.id);
                $('#merchants_data_form input[name="name"]').val(m.name);
                $('#merchants_data_form textarea[name="note"]').val(m.note);
                $('#merchant_balance_input_group').hide();
                $('#merchants_data_popup').openpopup();
            }
        });
    });

    $(document).on('click', '.wallet_merchant_adjust_balance', function () {
        const id = $(this).data('id');
        $('#merchants_balance_form input[name="merchant_id"]').val(id);
        $.get('/get_merchant_details/' + id, function (response) {
            if (response.success) {
                const data = response.data;
                $('#merchant_balance_name').text(data.name || '-');
                $('#merchant_info_total').text(formatCurrency(data.balance || 0));
                $('#merchant_info_net').text(formatCurrency((data.balance || 0) * 0.99));
            }
        });
        $('#merchants_balance_popup').openpopup();
    });

    $('#merchant_open_deposit').on('click', function () {
        const id = $('#merchants_balance_form input[name="merchant_id"]').val();
        $('#merchants_deposit_form')[0].reset();
        $('#merchants_deposit_form input[name="merchant_id"]').val(id);
        $.get('/get_merchant_details/' + id, function (response) {
            if (response.success) {
                const data = response.data;
                $('#deposit_merchant_name').text(data.name || '-');
                $('#deposit_info_total').text(formatCurrency(data.balance || 0));
                $('#deposit_info_net').text(formatCurrency((data.balance || 0) * 0.99));
            }
        });
        $('#merchants_deposit_popup').openpopup();
    });

    $('#merchant_open_withdraw').on('click', function () {
        const id = $('#merchants_balance_form input[name="merchant_id"]').val();
        $('#merchants_withdraw_form')[0].reset();
        $('#merchants_withdraw_form input[name="merchant_id"]').val(id);
        $('#merchant_withdraw_calc').hide();
        $.get('/get_merchant_details/' + id, function (response) {
            if (response.success) {
                const data = response.data;
                $('#withdraw_merchant_name').text(data.name || '-');
                $('#withdraw_info_total').text(formatCurrency(data.balance || 0));
                $('#withdraw_info_net').text(formatCurrency((data.balance || 0) * 0.99));
            }
        });
        $('#merchants_withdraw_popup').openpopup();
    });

    // Withdraw calculation
    $(document).on('input', '#merchants_withdraw_popup #merchant_net_amount, #merchant_net_amount', function () {
        const netAmount = parseFloat($(this).val());
        if (isNaN(netAmount) || netAmount <= 0) { $('#merchant_withdraw_calc').hide(); return; }
        const totalAmount = Math.round(netAmount / 0.99 * 100) / 100;
        const fee = Math.round((totalAmount - netAmount) * 100) / 100;
        const merchantId = $('#merchants_withdraw_form input[name="merchant_id"]').val();
        $.get('/get_merchant_details/' + merchantId, function (response) {
            if (response.success) {
                const currentBalance = response.data.balance || 0;
                const availableNet = Math.round(currentBalance * 0.99 * 100) / 100;
                $('.withdraw-error-msg').remove();
                if (netAmount > availableNet) {
                    $('#merchant_withdraw_calc').show();
                    $('#calc_net_amount').text(formatCurrency(netAmount));
                    $('#calc_fee').text(formatCurrency(fee));
                    $('#calc_total').text(formatCurrency(totalAmount));
                    $('#merchants_withdraw_form button[type="submit"]').before(`<div class="withdraw-error-msg" style="color: #ff5e5e; text-align: center; margin-bottom: 10px;">${t('merchants.insufficient_balance')}</div>`);
                    return;
                }
                $('#merchant_withdraw_calc').show();
                $('#calc_net_amount').text(formatCurrency(netAmount));
                $('#calc_fee').text(formatCurrency(fee));
                $('#calc_total').text(formatCurrency(totalAmount));
            }
        });
    });

    // Deposit button click
    $('#merchant_deposit_btn').on('click', function () {
        const merchant_id = $('#merchants_deposit_form input[name="merchant_id"]').val();
        const amount = parseFloat($('#merchants_deposit_form input[name="deposit_amount"]').val());
        const note = $('#merchants_deposit_form textarea[name="deposit_note"]').val() || '';
        if (isNaN(amount) || amount <= 0) return showToast(t('common.invalid_amount'), 'error');
        $('#confirm_deposit_merchant_name').text($('#deposit_merchant_name').text());
        $('#confirm_deposit_amount').text(formatCurrency(amount));
        $('#confirm_deposit_note').text(note || '-');
        $('#merchants_deposit_confirm_popup').openpopup();
    });

    // Confirm deposit
    $('#confirm_deposit_yes').on('click', function () {
        const merchant_id = $('#merchants_deposit_form input[name="merchant_id"]').val();
        const amount = parseFloat($('#merchants_deposit_form input[name="deposit_amount"]').val());
        const note = $('#merchants_deposit_form textarea[name="deposit_note"]').val() || '';
        if (isNaN(amount) || amount <= 0) return showToast(t('common.invalid_amount'), 'error');
        $.ajax({
            url: '/adjust_merchant_balance', type: 'POST',
            data: { merchant_id, amount: Math.abs(amount), note },
            success: function (res) {
                if (res.success) {
                    showToast('✅ ' + (res.message || t('merchants.balance_updated')), 'success');
                    $('#merchants_deposit_confirm_popup').closepopup();
                    $('#merchants_deposit_popup').closepopup();
                    $('#merchants_balance_popup').closepopup();
                }
            },
            error: function (xhr) { showToast('❌ ' + (xhr.responseJSON?.error || t('common.error')), 'error'); }
        });
    });

    // Withdraw form submit
    $('#merchants_withdraw_form').on('submit', function (e) {
        e.preventDefault();
        const merchant_id = $(this).find('input[name="merchant_id"]').val();
        const netAmount = parseFloat($(this).find('input[name="net_amount"]').val());
        const note = $(this).find('textarea[name="withdraw_note"]').val() || '';
        if (isNaN(netAmount) || netAmount <= 0) return showToast(t('common.invalid_amount'), 'error');
        const totalAmount = Math.round(netAmount / 0.99 * 100) / 100;
        $.ajax({
            url: '/adjust_merchant_balance', type: 'POST',
            data: { merchant_id, amount: -totalAmount, note: ('سحب ' + formatCurrency(netAmount) + ' صافي - ' + note).trim() },
            success: function (res) {
                if (res.success) {
                    showToast('✅ ' + t('merchants.withdraw_success'), 'success');
                    $('#merchants_withdraw_popup').closepopup();
                    $('#merchants_balance_popup').closepopup();
                }
            },
            error: function (xhr) { showToast('❌ ' + (xhr.responseJSON?.error || t('common.error')), 'error'); }
        });
    });

    // Save merchant form
    $('#merchants_data_form').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/save_merchant', type: 'POST',
            data: $(this).serialize(),
            success: function (res) {
                if (res.success) {
                    showToast('✅ ' + (res.message || t('admin.toast_saved')), 'success');
                    $('#merchants_data_popup').closepopup();
                }
            },
            error: function (xhr) { showToast('❌ ' + (xhr.responseJSON?.error || t('common.error')), 'error'); }
        });
    });

    // Initialize
    loadCurrentUserRole();
    setupWalletSocketListeners();
});
