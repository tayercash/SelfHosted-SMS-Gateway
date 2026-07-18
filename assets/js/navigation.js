var now_navigation_link_index = 0;
var navigationCache = {};
var isTransitioning = false;

if (!window.navigationJsInitialized) {
    window.navigationJsInitialized = true;

    // تتبع استدعاءات fetch الأصلية للمتصفح لدعم صفحات الكروت الصفراء والمحافظ
    (function () {
        if (window.fetchPatched) return;
        window.fetchPatched = true;
        const originalFetch = window.fetch;
        window.activeFetchCount = 0;

        window.fetch = function (...args) {
            window.activeFetchCount++;
            $(document).trigger('fetchStart');

            return originalFetch.apply(this, args).then(
                function (response) {
                    window.activeFetchCount--;
                    $(document).trigger('fetchEnd');
                    return response;
                },
                function (error) {
                    window.activeFetchCount--;
                    $(document).trigger('fetchEnd');
                    throw error;
                }
            );
        };
    })();

    window.isNetworkIdle = function () {
        const activeJQuery = typeof $ !== 'undefined' && $.active ? $.active : 0;
        const activeFetch = window.activeFetchCount || 0;
        return activeJQuery === 0 && activeFetch === 0;
    };

    // إدارة شريط التحميل العلوي الذكي (Top Progress Bar) لأي عملية داتا بيز
    (function () {
        $(document).ready(function () {
            if ($('#top-progress-bar').length === 0) {
                $('head').append(`
                    <style>
                        #top-progress-bar {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 0;
                            height: 3px;
                            background: linear-gradient(90deg, #ffcc00, #ff9900);
                            box-shadow: 0 0 10px rgba(255, 204, 0, 0.7), 0 0 5px rgba(255, 204, 0, 0.4);
                            z-index: 1000000005;
                            transition: width 0.3s ease, opacity 0.3s ease;
                            opacity: 0;
                            pointer-events: none;
                        }
                        #top-progress-bar.loading {
                            opacity: 1;
                            animation: pulseProgressBar 2s infinite ease-in-out;
                        }
                        @keyframes pulseProgressBar {
                            0% { filter: brightness(1); }
                            50% { filter: brightness(1.3); }
                            100% { filter: brightness(1); }
                        }
                    </style>
                `);
                $('body').append('<div id="top-progress-bar"></div>');
            }
        });

        let progressInterval = null;
        let currentProgress = 0;

        window.startTopProgress = function () {
            if (progressInterval) clearInterval(progressInterval);
            const $bar = $('#top-progress-bar');
            $bar.addClass('loading').css({ width: '0%', opacity: 1 });

            currentProgress = 15;
            $bar.css('width', currentProgress + '%');

            progressInterval = setInterval(() => {
                if (currentProgress < 90) {
                    currentProgress += (90 - currentProgress) * 0.15;
                    $bar.css('width', currentProgress + '%');
                }
            }, 100);
        };

        window.endTopProgress = function () {
            if (progressInterval) clearInterval(progressInterval);
            const $bar = $('#top-progress-bar');
            $bar.css('width', '100%');

            setTimeout(() => {
                $bar.css('opacity', 0);
                setTimeout(() => {
                    $bar.removeClass('loading').css('width', '0%');
                }, 300);
            }, 200);
        };

        // ربط مستمعات شبكة الاتصال لتشغيل وإيقاف الـ Progress Bar تلقائياً
        $(document).on('ajaxStart fetchStart', function () {
            window.startTopProgress();
        });

        $(document).on('ajaxStop fetchEnd', function () {
            setTimeout(() => {
                if (window.isNetworkIdle()) {
                    window.endTopProgress();
                }
            }, 50);
        });
    })();

    $(document).off('click', '.sidebar-menu .menu-item').on('click', '.sidebar-menu .menu-item', function () {
        if (isTransitioning) return;

        const $this = $(this);
        const old_navigation_link = $(".sidebar-menu .menu-item").eq(now_navigation_link_index).attr("data-full_iframe_target_url");
        const new_navigation_link = $this.attr("data-full_iframe_target_url");

        // حفظ الصفحة المستهدفة في sessionStorage
        if (new_navigation_link) {
            sessionStorage.setItem('active_nav_url', new_navigation_link);
        }

        if (new_navigation_link === old_navigation_link && navigationCache[new_navigation_link]) return;

        isTransitioning = true;
        $(".full_app_loader").css("display", "flex").hide().fadeIn(200);

        // 1. حفظ وفصل الصفحة الحالية
        if (old_navigation_link) {
            const $currentActive = $(`[data-navigation_url="${old_navigation_link}"]`);
            if ($currentActive.length > 0) {
                const scrollPos = $(window).scrollTop();
                $(".sidebar-menu .menu-item").eq(now_navigation_link_index).attr("data-scrolled_from_top", scrollPos);
                $currentActive.removeClass("show").addClass("hidden");
                navigationCache[old_navigation_link] = $currentActive.detach();
            }
        }

        // 2. تحديث النفيجيشن
        $(".sidebar-menu .menu-item").removeClass("active");
        $this.addClass("active");
        now_navigation_link_index = $(".sidebar-menu .menu-item").index(this);
        // fix_indicator_positon();
        this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

        const nav_header_title = typeof $this.attr("data-header_title") !== "undefined" ? " - " + $this.attr("data-header_title") : "";
        $("#extra_title").text(nav_header_title);

        // 3. عرض الصفحة الجديدة
        setTimeout(() => {
            if (navigationCache[new_navigation_link]) {
                const $page = navigationCache[new_navigation_link];

                // فك الـ custom-select wrappers القديمة وإعادة تهيئتها
                $page.find('.custom-select-wrapper').each(function () {
                    const $sel = $(this).find('select');
                    if ($sel.length) {
                        const cid = $sel.attr('data-custom-id');
                        if (cid) $(`.custom-options[data-for="${cid}"]`).remove();
                        $(this).replaceWith($sel);
                        $sel.removeClass('select-hidden').removeAttr('data-custom-id');
                    }
                });

                $("#content").append($page);
                $page.removeClass("hidden");
                setTimeout(() => $page.addClass("show"), 50);
                $(document).trigger('page_shown', [new_navigation_link]);
                if (typeof initCustomSelects === "function") initCustomSelects();

                // بالنسبة للكاش، ننهي الانتقال فوراً لأن البيانات موجودة
                const latest_scrolled_from_top = parseInt($this.attr("data-scrolled_from_top")) || 0;
                $(window).scrollTop(latest_scrolled_from_top);

                setTimeout(() => {
                    $(".full_app_loader").fadeOut(300);
                    isTransitioning = false;
                    if (typeof resize_text === "function") resize_text();
                }, 200);
            } else {
                load_navigation_html_content(new_navigation_link);
            }
        }, 300);
    });

    $(document).on('page_ready', function (e, url) {
        const activeUrl = $(".sidebar-menu .menu-item.active").attr("data-full_iframe_target_url");
        if (url === activeUrl) {
            const $activeLi = $(".sidebar-menu .menu-item").eq(now_navigation_link_index);
            const $page = $(`[data-navigation_url="${url}"]`);

            $page.removeClass("hidden");
            setTimeout(() => $page.addClass("show"), 50);
            $(document).trigger('page_shown', [url]);

            const latest_scrolled_from_top = parseInt($activeLi.attr("data-scrolled_from_top")) || 0;
            $(window).scrollTop(latest_scrolled_from_top);

            setTimeout(() => {
                $(".full_app_loader").fadeOut(400);
                isTransitioning = false;
                if (typeof resize_text === "function") resize_text();
            }, 200);
        }
    });
}

function load_navigation_html_content(new_navigation_link) {
    let safetyTimeout = null;
    let transitionCompleted = false;

    function completeTransition() {
        if (transitionCompleted) return;
        transitionCompleted = true;

        if (safetyTimeout) clearTimeout(safetyTimeout);
        $(document).off('ajaxStop.nav fetchEnd.nav');

        const pageEl = $(`[data-navigation_url="${new_navigation_link}"]`);
        if (pageEl.length > 0) {
            pageEl.removeClass("hidden");
            setTimeout(() => pageEl.addClass("show"), 50);
        }
        $(document).trigger('page_shown', [new_navigation_link]);

        $(".full_app_loader").fadeOut(400);
        isTransitioning = false;
        if (typeof resize_text === "function") resize_text();
    }

    // ربط مستمع ajaxStop و fetchEnd مخصص لهذه الانتقالة
    $(document).on('ajaxStop.nav fetchEnd.nav', function () {
        setTimeout(() => {
            if (window.isNetworkIdle()) {
                completeTransition();
            }
        }, 250); // 250ms للتأكد من بدء استعلامات الملفات والـ Script وطلبات الداتا بيز والـ fetch
    });

    // مؤقت أمان 4 ثوانٍ كحد أقصى في حال انقطاع الشبكة أو عدم وجود استعلامات
    safetyTimeout = setTimeout(function () {
        completeTransition();
    }, 4000);

    $.ajax({
        "type": "GET",
        "url": new_navigation_link,
        success: function (res, status, xhr) {
            if (xhr.status == 200) {
                const new_html = $(`<div data-navigation_url="${new_navigation_link}" class="hidden">${res}</div>`);

                if ($(new_html).find("#header_actions").length > 0) {
                    const action_btns = $(new_html).find("#header_actions").html();
                    $("#header_actions").html(action_btns);
                    $(new_html).find("#header_actions").remove();
                }

                $("#content").append(new_html);
                if (typeof PopupManager !== "undefined") PopupManager.init();
                if (typeof initCustomSelects === "function") initCustomSelects();
                if (typeof i18n !== "undefined") i18n.translateDOM(new_html[0]);
            }
        },
        error: function () {
            completeTransition();
        }
    });
}


$(document).ready(function () {
    // fix_indicator_positon(false);

    // محاولة استعادة الصفحة النشطة من sessionStorage
    const savedUrl = sessionStorage.getItem('active_nav_url');
    let $targetLi = null;

    if (savedUrl) {
        $targetLi = $(`.sidebar-menu .menu-item[data-full_iframe_target_url="${savedUrl}"]`).eq(0);
    }

    // إذا لم تكن مخزنة أو لم يُعثر على الصفحة، نأخذ التبويب الافتراضي
    if (!$targetLi || $targetLi.length === 0) {
        $targetLi = $(".navigation ul li.active").eq(0);
    }
    // إذا لم يتم العثور على أي عنصر نشط، نأخذ العنصر النشط من القائمة الجانبية
    if (!$targetLi || $targetLi.length === 0) {
        $targetLi = $(".sidebar-menu .menu-item.active").eq(0);
    }

    if ($targetLi && $targetLi.length) {
        // إزالة التنشيط عن بقية العناصر وإضافته للعنصر المراد فتحه
        $(".sidebar-menu .menu-item").removeClass("active");
        $targetLi.addClass("active");
        now_navigation_link_index = $(".sidebar-menu .menu-item").index($targetLi[0]);
        // fix_indicator_positon(false);

        const url = $targetLi.attr("data-full_iframe_target_url") || $targetLi.find("a").attr("data-full_iframe_target_url");
        sessionStorage.setItem('active_nav_url', url);

        const nav_header_title = typeof $targetLi.attr("data-header_title") !== "undefined" ? " - " + $targetLi.attr("data-header_title") : "";
        $("#extra_title").text(nav_header_title);

        // إظهار شاشة التحميل لمنع الرمش قبل جلب البيانات
        $(".full_app_loader").css("display", "flex").show();
        load_navigation_html_content(url);
    }

    document.addEventListener('i18n:ready', function () {
        $("#content").children('[data-navigation_url]').each(function () {
            i18n.translateDOM(this);
        });
    });
});
