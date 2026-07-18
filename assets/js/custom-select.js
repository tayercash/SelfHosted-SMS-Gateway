function initCustomSelects() {
    $('select:not(.no-custom)').each(function () {
        const $this = $(this);

        // منع التكرار إذا تم التحويل مسبقاً، ولكن نقوم بتحديث الخيارات إذا تم استدعاء دالة التحديث
        if ($this.parent().hasClass('custom-select-wrapper')) {
            return;
        }

        const selectId = $this.attr('id') || Math.random().toString(36).substr(2, 9);
        $this.attr('data-custom-id', selectId);

        const options = $this.find('option');
        const $wrapper = $('<div class="custom-select-wrapper"></div>');
        const $customSelect = $('<div class="custom-select"></div>');
        const $trigger = $('<div class="custom-select-trigger"></div>');
        const $optionsContainer = $('<div class="custom-options"></div>');

        // إخفاء الـ select الأصلي وإضافة الـ wrapper
        $this.addClass('select-hidden');
        $this.wrap($wrapper);
        $this.after($customSelect);

        // نقل قائمة الخيارات إلى الـ body لمنع الـ clipping
        $optionsContainer.attr('data-for', selectId);
        $('body').append($optionsContainer);

        // تعيين النص الافتراضي (المحدد حالياً)
        const selectedText = options.filter(':selected').text() || options.first().text();
        $trigger.text(selectedText);
        $customSelect.append($trigger);

        // إنشاء البحث والخيارات المخصصة
        const hasSearch = options.length > 7;
        if (hasSearch) {
            const $searchBox = $('<div class="custom-select-search-box" style="padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #121214; position: sticky; top: 0; z-index: 10;"><input type="text" placeholder="' + t('common.search_placeholder') + '" class="custom-select-search-input" style="width:100%; padding: 6px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color:#fff; font-size:0.85rem; text-align:right; outline:none; font-family:inherit;"></div>');
            $optionsContainer.append($searchBox);

            $searchBox.find('input').on('click', function(e) {
                e.stopPropagation();
            }).on('input', function(e) {
                const query = $(this).val().toLowerCase().trim();
                $optionsContainer.find('.custom-option').each(function() {
                    const text = $(this).text().toLowerCase();
                    const keywords = ($(this).attr('data-search-keywords') || '').toLowerCase();
                    if (text.indexOf(query) > -1 || keywords.indexOf(query) > -1) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            });
        }

        options.each(function () {
            const $option = $(this);
            const $customOption = $('<div class="custom-option"></div>')
                .text($option.text())
                .attr('data-value', $option.val())
                .attr('data-search-keywords', $option.attr('data-search-keywords') || '');

            if ($option.is(':selected')) {
                $customOption.addClass('selection');
            }

            $optionsContainer.append($customOption);
        });

        // التفاعل: فتح وإغلاق القائمة
        $trigger.on('click', function (e) {
            e.stopPropagation();
            const isOpen = $customSelect.hasClass('open');

            // إغلاق أي قوائم أخرى
            $('.custom-select').removeClass('open');
            $('.custom-options').not($optionsContainer).removeClass('open-options');

            if (!isOpen) {
                $customSelect.addClass('open');
                $optionsContainer.addClass('open-options');
                
                const $currentSearch = $optionsContainer.find('.custom-select-search-input');
                if ($currentSearch.length > 0) {
                    $currentSearch.val('').trigger('input');
                }
                
                updateOptionsPosition();
                
                if ($currentSearch.length > 0) {
                    setTimeout(() => $currentSearch.focus(), 50);
                }
            } else {
                $customSelect.removeClass('open');
                $optionsContainer.removeClass('open-options');
            }
        });

        function updateOptionsPosition() {
            if ($customSelect.hasClass('open')) {
                const rect = $trigger[0].getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                // إظهار مؤقت لحساب العرض والارتفاع
                $optionsContainer.css({ visibility: 'hidden', display: 'block', width: 'max-content' });
                const dropdownWidth = $optionsContainer.outerWidth();
                const dropdownHeight = $optionsContainer.outerHeight();
                $optionsContainer.css({ visibility: '', display: '' });

                let cssProps = {
                    position: 'fixed',
                    zIndex: 2147483647,
                    minWidth: rect.width + 'px',
                    width: 'max-content',
                    maxWidth: '200px',
                    left: rect.left + 'px',
                    right: 'auto'
                };

                // تحديد الاتجاه الرأسي (أعلى أو أسفل الزر)
                if (rect.bottom + dropdownHeight > windowHeight && rect.top > dropdownHeight) {
                    cssProps.top = (rect.top - dropdownHeight - 5) + 'px';
                } else {
                    cssProps.top = (rect.bottom + 5) + 'px';
                }

                // منع الخروج من حواف الشاشة أفقياً
                if (rect.left + rect.width > windowWidth) {
                    cssProps.left = 'auto';
                    cssProps.right = (windowWidth - rect.right) + 'px';
                }

                $optionsContainer.css(cssProps);
            }
        }

        // تحديث المكان عند السكرول أو تغيير حجم الشاشة بأداء عالي
        let selectTicking = false;
        function handleSelectScroll() {
            if (!selectTicking) {
                window.requestAnimationFrame(function () {
                    updateOptionsPosition();
                    selectTicking = false;
                });
                selectTicking = true;
            }
        }

        $(window).on('scroll resize', handleSelectScroll);
        $('.header, .full_view').on('scroll', handleSelectScroll);

        // التفاعل: اختيار خيار
        $optionsContainer.on('click', '.custom-option', function (e) {
            e.stopPropagation();
            const val = $(this).attr('data-value');
            const text = $(this).text();

            $this.val(val).trigger('change');
            $trigger.text(text);

            $(this).addClass('selection').siblings().removeClass('selection');
            $customSelect.removeClass('open');
            $optionsContainer.removeClass('open-options');
        });
    });
}

// إغلاق القوائم عند الضغط في أي مكان خارجها
$(document).on('click', function () {
    $('.custom-select').removeClass('open');
    $('.custom-options').removeClass('open-options');
});

// دالة لتحديث الخيارات بعد تغييرها ديناميكياً
window.updateCustomSelect = function($select) {
    const selectId = $select.attr('data-custom-id');
    if (!selectId) return;

    const $optionsContainer = $(`.custom-options[data-for="${selectId}"]`);
    const $trigger = $select.siblings('.custom-select').find('.custom-select-trigger');
    const options = $select.find('option');

    $optionsContainer.empty();
    let selectedText = '';

    const hasSearch = options.length > 7;
    if (hasSearch) {
        const $searchBox = $('<div class="custom-select-search-box" style="padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #121214; position: sticky; top: 0; z-index: 10;"><input type="text" placeholder="' + t('common.search_placeholder') + '" class="custom-select-search-input" style="width:100%; padding: 6px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color:#fff; font-size:0.85rem; text-align:right; outline:none; font-family:inherit;"></div>');
        $optionsContainer.append($searchBox);

        $searchBox.find('input').on('click', function(e) {
            e.stopPropagation();
        }).on('input', function(e) {
            const query = $(this).val().toLowerCase().trim();
            $optionsContainer.find('.custom-option').each(function() {
                const text = $(this).text().toLowerCase();
                const keywords = ($(this).attr('data-search-keywords') || '').toLowerCase();
                if (text.indexOf(query) > -1 || keywords.indexOf(query) > -1) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });
    }

    options.each(function () {
        const $option = $(this);
        const $customOption = $('<div class="custom-option"></div>')
            .text($option.text())
            .attr('data-value', $option.val())
            .attr('data-search-keywords', $option.attr('data-search-keywords') || '');

        if ($option.is(':selected')) {
            $customOption.addClass('selection');
            selectedText = $option.text();
        }

        $optionsContainer.append($customOption);
    });

    if (!selectedText) selectedText = options.first().text();
    $trigger.text(selectedText);

    if (typeof addOnlineDots === 'function') {
        addOnlineDots($select);
    }
};

// تشغيل أولي عند تحميل الصفحة
$(document).ready(function () {
    initCustomSelects();

    // إضافة مستمع عالمي لتحديث القوائم المخصصة تلقائياً عند تغيير القيمة
    $(document).on('change', 'select', function() {
        if (window.updateCustomSelect) {
            window.updateCustomSelect($(this));
        }
    });

    // تحديث جميع القوائم عند تغيير اللغة
    document.addEventListener('i18n:ready', function () {
        $('.custom-options').empty();
        $('.custom-select-wrapper').each(function () {
            var $select = $(this).find('select');
            if ($select.length) {
                $(this).replaceWith($select);
                $select.removeClass('select-hidden');
            }
        });
        $('.custom-options').remove();
        initCustomSelects();
    });
});
