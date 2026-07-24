$(document).ready(function () {
    function stringToColor(str) {
        if (!str) return '#fff';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            '#ffcc00', '#00ffcc', '#ff66cc', '#ccff66',
            '#66ccff', '#ff9966', '#cc99ff', '#66ff99',
            '#ff5e5e', '#5eff5e', '#5e5eff', '#ffff5e'
        ];
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    let currentUserRole = 'user';
    window.isAdmin = false;

    (async function initializePage() {
        try {
            const response = await fetch('/api/me');
            if (response.ok) {
                const data = await response.json();
                window.isAdmin = data.role === 'admin';
            }
        } catch (err) {
            console.warn('Unable to load current user role:', err);
            window.isAdmin = false;
        }
        if (!window.isAdmin) {
            $('.add_merchant_btn').hide();
        }
        fetchMerchants();
        setupMerchantSocketListeners();
    })();

    function formatCurrency(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return '$0.00';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
    }

    function calculateTotalBalance() {
        let total = 0;
        $('.merchant_balance').each(function () {
            const val = parseFloat($(this).text().replace(/[^0-9.-]/g, '')) || 0;
            total += val;
        });
        $('#merchants_total_balance').text(formatCurrency(total));
        $('#merchants_total_net_balance').text(formatCurrency(total * 0.99));
    }

    function fetchMerchants() {
        $.ajax({
            url: '/get_merchants',
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const container = $('#merchants_container');
                    container.empty();
                    response.data.forEach(function (merchant) {
                        container.append(createMerchantCard(merchant));
                    });
                    calculateTotalBalance();
                }
            },
            error: function () {
                showToast(t('merchants.load_error'), 'error');
            }
        });
    }

    function createMerchantCard(merchant) {
        return '<div class="visa-card merchant-card" id="merchant_' + merchant.id + '">\
            <div class="card-header">\
                <div class="Name" style="color: ' + stringToColor(merchant.name) + ';">' + (merchant.name || '-') + '</div>\
                <span class="chip">\
                    <span class="action merchant_transactions" data-id="' + merchant.id + '"><i class="fas fa-list"></i></span>\
                </span>\
            </div>\
            <div class="card-details-grid">\
                <div class="detail-item">\
                    <span class="label">' + t('wallets.balance') + '</span>\
                    <span class="value merchant_balance">' + formatCurrency(merchant.balance || 0) + '</span>\
                </div>\
                <div class="detail-item">\
                    <span class="label">' + t('wallets.net_balance') + '</span>\
                    <span class="value merchant_net_balance" style="color: #00ffcc; font-weight: bold;">' + formatCurrency((merchant.balance || 0) * 0.99) + '</span>\
                </div>\
                <div class="detail-item">\
                    <span class="label">' + t('merchants.linked_wallets') + '</span>\
                    <span class="value linked_wallets_count">' + (merchant.linked_wallets_count || 0) + '</span>\
                </div>\
                <div class="detail-item">\
                    <span class="label">' + t('admin.col_actions') + '</span>\
                    <div class="merchant_actions">\
                        <span class="action merchant_edit" data-id="' + merchant.id + '"><i class="fas fa-edit"></i></span>\
                        <span class="action merchant_adjust_balance" data-id="' + merchant.id + '"><i class="fas fa-exchange-alt"></i></span>\
                        ' + (window.isAdmin ? '<span class="action merchant_delete" data-id="' + merchant.id + '" data-name="' + (merchant.name || '') + '" style="color:#ef4444;"><i class="fas fa-trash"></i></span>' : '') + '\
                    </div>\
                </div>\
            </div>\
        </div>';
    }

    // Add merchant
    $(document).off('click', '.add_merchant_btn').on('click', '.add_merchant_btn', function () {
        if (!window.isAdmin) return showToast(t('common.unauthorized'), 'error');
        $('#merchants_data_form')[0].reset();
        $('#merchants_data_form input[name="id"]').val("");
        $('#merchant_balance_input_group').show();
        $('#merchants_data_popup').openpopup();
    });

    // Edit merchant
    $(document).off('click', '.merchant_edit').on('click', '.merchant_edit', function () {
        if (!window.isAdmin) return;
        const id = $(this).data('id');
        $.ajax({
            url: '/get_merchant_details/' + id,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const data = response.data;
                    const form = $('#merchants_data_form');
                    form.find('input[name="id"]').val(data.id);
                    form.find('input[name="name"]').val(data.name);
                    form.find('textarea[name="note"]').val(data.note);
                    $('#merchant_balance_input_group').hide();
                    $('#merchants_data_popup').openpopup();
                }
            }
        });
    });

    // Delete merchant
    $(document).off('click', '.merchant_delete').on('click', '.merchant_delete', function () {
        if (!window.isAdmin) return;
        const id = $(this).data('id');
        const name = $(this).data('name');
        $('#del-merchant-id').val(id);
        $('#del-merchant-name').text(name);
        $('#del-merchant-result').text('');
        $('#merchants_delete_popup').openpopup();
    });

    $(document).off('click', '#confirm_delete_merchant').on('click', '#confirm_delete_merchant', function () {
        const id = $('#del-merchant-id').val();
        if (!id) return;
        $(this).prop('disabled', true).text('...');
        $.ajax({
            url: '/delete_merchant',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ merchant_id: parseInt(id) }),
            success: function (res) {
                if (res.success) {
                    const el = document.getElementById('merchant_' + id);
                    if (el) el.remove();
                    calculateTotalBalance();
                    $('#merchants_delete_popup').closepopup();
                    showToast(t('merchants.deleted') || 'تم حذف التاجر', 'success');
                } else {
                    $('#del-merchant-result').text(res.error || 'Error').css('color', '#ef4444');
                }
                $('#confirm_delete_merchant').prop('disabled', false).html('<i class="fas fa-trash"></i> <span data-i18n="merchants.confirm_delete">تأكيد الحذف</span>');
            },
            error: function (xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.error : 'Error';
                $('#del-merchant-result').text(msg).css('color', '#ef4444');
                $('#confirm_delete_merchant').prop('disabled', false).html('<i class="fas fa-trash"></i> <span data-i18n="merchants.confirm_delete">تأكيد الحذف</span>');
            }
        });
    });

    // Save merchant
    $(document).off('submit', '#merchants_data_form').on('submit', '#merchants_data_form', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/save_merchant',
            type: 'POST',
            data: $(this).serialize(),
            success: function (res) {
                if (res.success) {
                    showToast('\u2705 ' + (res.message || t('admin.toast_saved')), 'success');
                    $('#merchants_data_popup').closepopup();
                    fetchMerchants();
                }
            },
            error: function (xhr) {
                showToast('\u274c ' + (xhr.responseJSON?.error || t('common.error')), 'error');
            }
        });
    });

    // Adjust balance popup
    $(document).off('click', '.merchant_adjust_balance').on('click', '.merchant_adjust_balance', function () {
        const id = $(this).data('id');
        $('#merchants_balance_form input[name="merchant_id"]').val(id);
        $.ajax({
            url: '/get_merchant_details/' + id,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const data = response.data;
                    $('#merchant_balance_name').text(data.name || '-');
                    $('#merchant_info_total').text(formatCurrency(data.balance || 0));
                    $('#merchant_info_net').text(formatCurrency((data.balance || 0) * 0.99));
                }
            }
        });
        $('#merchants_balance_popup').openpopup();
    });

    // Open deposit
    $(document).off('click', '#merchant_open_deposit').on('click', '#merchant_open_deposit', function () {
        const id = $('#merchants_balance_form input[name="merchant_id"]').val();
        $('#merchants_deposit_form')[0].reset();
        $('#merchants_deposit_form input[name="merchant_id"]').val(id);
        $.ajax({
            url: '/get_merchant_details/' + id,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const data = response.data;
                    $('#deposit_merchant_name').text(data.name || '-');
                    $('#deposit_info_total').text(formatCurrency(data.balance || 0));
                    $('#deposit_info_net').text(formatCurrency((data.balance || 0) * 0.99));
                }
            }
        });
        $('#merchants_deposit_popup').openpopup();
    });

    // Open withdraw
    $(document).off('click', '#merchant_open_withdraw').on('click', '#merchant_open_withdraw', function () {
        const id = $('#merchants_balance_form input[name="merchant_id"]').val();
        $('#merchants_withdraw_form')[0].reset();
        $('#merchants_withdraw_form input[name="merchant_id"]').val(id);
        $('#merchant_withdraw_calc').hide();
        $.ajax({
            url: '/get_merchant_details/' + id,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const data = response.data;
                    $('#withdraw_merchant_name').text(data.name || '-');
                    $('#withdraw_info_total').text(formatCurrency(data.balance || 0));
                    $('#withdraw_info_net').text(formatCurrency((data.balance || 0) * 0.99));
                }
            }
        });
        $('#merchants_withdraw_popup').openpopup();
    });

    // Withdraw calculation
    $(document).off('input', '#merchant_net_amount').on('input', '#merchant_net_amount', function () {
        const netAmount = parseFloat($(this).val());
        if (isNaN(netAmount) || netAmount <= 0) { $('#merchant_withdraw_calc').hide(); return; }
        const totalAmount = Math.round(netAmount / 0.99 * 100) / 100;
        const fee = Math.round((totalAmount - netAmount) * 100) / 100;
        const merchantId = $('#merchants_withdraw_form input[name="merchant_id"]').val();
        $.ajax({
            url: '/get_merchant_details/' + merchantId,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const currentBalance = response.data.balance || 0;
                    const availableNet = Math.round(currentBalance * 0.99 * 100) / 100;
                    $('.withdraw-error-msg').remove();
                    if (netAmount > availableNet) {
                        $('#merchant_withdraw_calc').show();
                        $('#calc_net_amount').text(formatCurrency(netAmount));
                        $('#calc_fee').text(formatCurrency(fee));
                        $('#calc_total').text(formatCurrency(totalAmount));
                        $('#merchants_withdraw_form button[type="submit"]').before('<div class="withdraw-error-msg" style="color: #ff5e5e; text-align: center; margin-bottom: 10px;">' + t('merchants.insufficient_balance') + '</div>');
                        return;
                    }
                    $('#merchant_withdraw_calc').show();
                    $('#calc_net_amount').text(formatCurrency(netAmount));
                    $('#calc_fee').text(formatCurrency(fee));
                    $('#calc_total').text(formatCurrency(totalAmount));
                }
            }
        });
    });

    // Deposit button click (show confirmation)
    $(document).off('click', '#merchant_deposit_btn').on('click', '#merchant_deposit_btn', function () {
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
    $(document).off('click', '#confirm_deposit_yes').on('click', '#confirm_deposit_yes', function () {
        const merchant_id = $('#merchants_deposit_form input[name="merchant_id"]').val();
        const amount = parseFloat($('#merchants_deposit_form input[name="deposit_amount"]').val());
        const note = $('#merchants_deposit_form textarea[name="deposit_note"]').val() || '';
        if (isNaN(amount) || amount <= 0) return showToast(t('common.invalid_amount'), 'error');
        $.ajax({
            url: '/adjust_merchant_balance',
            type: 'POST',
            data: { merchant_id, amount: Math.abs(amount), note },
            success: function (res) {
                if (res.success) {
                    showToast('\u2705 ' + (res.message || t('merchants.balance_updated')), 'success');
                    $('#merchants_deposit_confirm_popup').closepopup();
                    $('#merchants_deposit_popup').closepopup();
                    $('#merchants_balance_popup').closepopup();
                    fetchMerchants();
                }
            },
            error: function (xhr) { showToast('\u274c ' + (xhr.responseJSON?.error || t('common.error')), 'error'); }
        });
    });

    // Withdraw form submit
    $(document).off('submit', '#merchants_withdraw_form').on('submit', '#merchants_withdraw_form', function (e) {
        e.preventDefault();
        const merchant_id = $(this).find('input[name="merchant_id"]').val();
        const netAmount = parseFloat($(this).find('input[name="net_amount"]').val());
        const note = $(this).find('textarea[name="withdraw_note"]').val() || '';
        if (isNaN(netAmount) || netAmount <= 0) return showToast(t('common.invalid_amount'), 'error');
        const totalAmount = Math.round(netAmount / 0.99 * 100) / 100;
        $.ajax({
            url: '/adjust_merchant_balance',
            type: 'POST',
            data: { merchant_id, amount: -totalAmount, note: (t('merchants.withdraw_label') + ' ' + formatCurrency(netAmount) + ' ' + t('wallets.net_balance') + ' - ' + note).trim() },
            success: function (res) {
                if (res.success) {
                    showToast('\u2705 ' + t('merchants.withdraw_success'), 'success');
                    $('#merchants_withdraw_popup').closepopup();
                    $('#merchants_balance_popup').closepopup();
                    fetchMerchants();
                }
            },
            error: function (xhr) { showToast('\u274c ' + (xhr.responseJSON?.error || t('common.error')), 'error'); }
        });
    });

    // View transactions
    $(document).off('click', '.merchant_transactions').on('click', '.merchant_transactions', function () {
        const id = $(this).data('id');
        $.ajax({
            url: '/get_merchant_transactions/' + id,
            type: 'GET',
            success: function (res) {
                if (res.success) {
                    const container = $('#merchants_transactions_list');
                    container.empty();
                    if (res.data.length === 0) {
                        container.append('<p style="text-align: center; color: #666;">' + t('merchants.no_operations') + '</p>');
                    } else {
                        res.data.forEach(function (trans) {
                            const isPositive = trans.amount >= 0;
                            const cls = isPositive ? 'positive' : 'negative';
                            const sign = isPositive ? '+' : '-';
                            const typeName = trans.transaction_type === 'wallet_sync' ? t('merchants.system_wallet') : t('merchants.manual');
                            const date = trans.created_at ? new Date(trans.created_at).toLocaleString() : '';
                            container.append(`
                                <div class="transaction-item">
                                    <div class="t-details">
                                        <div class="t-main">
                                            <span class="transaction-amount ${cls}">${sign}${formatCurrency(Math.abs(trans.amount))}</span>
                                            <span class="t-type-badge ${cls}">${typeName}</span>
                                        </div>
                                        <div class="t-info">
                                            <span><i class="fas fa-user" style="opacity:0.5;"></i> ${trans.username || 'system'}</span>
                                            <span><i class="fas fa-clock" style="opacity:0.5;"></i> ${date}</span>
                                            ${trans.note ? '<span><i class="fas fa-comment" style="opacity:0.5;"></i> ' + trans.note + '</span>' : ''}
                                        </div>
                                    </div>
                                </div>
                            `);
                        });
                    }
                    $('#merchants_transactions_popup').openpopup();
                }
            }
        });
    });

    // Search
    $(document).off('click', '#merchants_search_btn').on('click', '#merchants_search_btn', function () {
        const searchContainer = $('#merchants_search_container');
        if (searchContainer.is(':hidden')) {
            searchContainer.slideDown(200, function () { $('#merchants_search_input').focus(); });
        } else {
            searchContainer.slideUp(200);
        }
    });

    $('#merchants_close_search').on('click', function () {
        $('#merchants_search_container').slideUp(200);
        $('#merchants_search_input').val('').trigger('keyup');
    });

    $('#merchants_search_input').on('keyup', function () {
        const value = $(this).val().toLowerCase().trim();
        const cards = $("#merchants_container .merchant-card");
        if (value === "") { cards.show(); return; }
        cards.each(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    // Socket listeners
    function setupMerchantSocketListeners() {
        if (!window.socket) {
            setTimeout(setupMerchantSocketListeners, 1000);
            return;
        }
        window.socket.off('merchant_updated');
        window.socket.on('merchant_updated', function (merchant) {
            const card = $('#merchant_' + merchant.id);
            if (card.length > 0) {
                card.find('.merchant_balance').text(formatCurrency(merchant.balance));
                card.find('.merchant_net_balance').text(formatCurrency((merchant.balance || 0) * 0.99));
                card.find('.linked_wallets_count').text(merchant.linked_wallets_count || 0);
                calculateTotalBalance();
                card.addClass('updated');
                setTimeout(function () { card.removeClass('updated'); }, 1000);
            } else {
                fetchMerchants();
            }
        });
        window.socket.off('merchant_deleted');
        window.socket.on('merchant_deleted', function (data) {
            if (data && data.id) {
                var el = document.getElementById('merchant_' + data.id);
                if (el) el.remove();
                calculateTotalBalance();
            }
        });
    }
});
