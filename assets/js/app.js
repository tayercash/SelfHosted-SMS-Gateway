$(document).ready(function () {
  initThemeToggle();
  initSidebar();
  initUserState();
  syncSidebarWithNav();
});

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;

  const updateIcon = function () {
    var isLight = document.documentElement.classList.contains('light');
    btn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  };

  updateIcon();

  btn.addEventListener('click', function () {
    var root = document.documentElement;
    var isLight = root.classList.contains('light');
    var newTheme = isLight ? 'dark' : 'light';
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon();
  });
}

function initSidebar() {
  var toggleBtn = document.getElementById('sidebar-toggle-btn');
  var closeBtn = document.getElementById('sidebar-close-btn');
  var sidebar = document.getElementById('app-sidebar');
  var backdrop = sidebar ? sidebar.querySelector('.sidebar-backdrop') : null;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      sidebar.classList.add('open');
      if (!document.getElementById('sidebar-overlay')) {
        var overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        document.body.appendChild(overlay);
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeSidebar();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', function () {
      closeSidebar();
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.id === 'sidebar-overlay') {
      e.stopPropagation();
      e.preventDefault();
      sidebar.classList.remove('open');
      clearTimeout(window._sidebarOverlayTimer);
      window._sidebarOverlayTimer = setTimeout(function () {
        var ov = document.getElementById('sidebar-overlay');
        if (ov) ov.remove();
      }, 100);
    }
  });

  (function () {
    var $sidebar = $(sidebar);
    var $content = $sidebar.find('.sidebar-content');
    var $backdrop = $sidebar.find('.sidebar-backdrop');

    var startX = 0, startY = 0, deltaX = 0;
    var isDragging = false, isScrolling = false;

    $content.on('touchstart', function (e) {
      if (!$sidebar.hasClass('open')) return;
      var t = e.originalEvent.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      deltaX = 0;
      isDragging = true;
      isScrolling = false;
      $content.css('transition', 'none');
      $content.css('touch-action', 'none');
    });

    $content.on('touchmove', function (e) {
      if (!isDragging) return;
      var t = e.originalEvent.touches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;

      if (!isScrolling && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        isScrolling = true;
        $content.css('transition', '');
        $content.css('touch-action', '');
        $content.css('transform', '');
        $backdrop.css('opacity', '');
        return;
      }
      if (isScrolling) return;

      e.preventDefault();

      var isRTL = ($('html').attr('dir') || 'rtl') === 'rtl';
      var maxDrag = isRTL ? 280 : startX;
      var dragValue;

      if (isRTL) {
        dragValue = Math.max(0, Math.min(dx, maxDrag));
      } else {
        dragValue = Math.max(-maxDrag, Math.min(0, dx));
      }

      deltaX = dragValue;
      $content.css('transform', 'translateX(' + dragValue + 'px)');

      var progress = Math.abs(dragValue) / maxDrag;
      $backdrop.css('opacity', 1 - progress);
    });

    $(document).on('touchend touchcancel', function () {
      if (!isDragging || isScrolling) {
        isDragging = false;
        return;
      }
      isDragging = false;
      $content.css('transition', '');
      $content.css('touch-action', '');

      var isRTL = ($('html').attr('dir') || 'rtl') === 'rtl';
      var threshold = isRTL ? 80 : Math.min(80, Math.max(30, startX * 0.4));
      var shouldClose = isRTL ? deltaX > threshold : Math.abs(deltaX) > threshold;

      if (shouldClose) {
        var targetX = isRTL ? '280px' : '-280px';
        var anim = $content[0].animate([
          { transform: $content[0].style.transform },
          { transform: 'translateX(' + targetX + ')' }
        ], {
          duration: 200,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        });
        anim.onfinish = function () {
          $content.css('transform', '');
          $backdrop.css('opacity', '');
          closeSidebar();
          anim.cancel();
        };
      } else {
        var currentTransform = $content[0].style.transform;
        var anim2 = $content[0].animate([
          { transform: currentTransform },
          { transform: 'translateX(0)' }
        ], {
          duration: 250,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        });
        anim2.onfinish = function () {
          $content.css('transform', '');
          $backdrop.css('opacity', '');
          anim2.cancel();
        };
      }
    });
  })();
}

function closeSidebar() {
  clearTimeout(window._sidebarOverlayTimer);
  $('#app-sidebar').removeClass('open');
  var ov = document.getElementById('sidebar-overlay');
  if (ov) ov.remove();
}
window.closeSidebar = closeSidebar;

function setAdminUI(isAdmin) {
  if (isAdmin) {
    $('#admin_btn_nav').removeClass('d-none');
    $('#sidebar-admin-btn').removeClass('d-none');
    $('#etisalat_btn_nav').removeClass('d-none');
    $('#sidebar-etisalat-btn').removeClass('d-none');
    $('#all_transactions_btn_nav').removeClass('d-none');
    $('#sidebar-all-transactions-btn').removeClass('d-none');
    $('#sidebar-modems-btn').removeClass('d-none');
    $('#sidebar-analysis-btn').removeClass('d-none');
    $('#sidebar-noip-btn').removeClass('d-none');
  } else {
    $('#admin_btn_nav').addClass('d-none');
    $('#sidebar-admin-btn').addClass('d-none');
    $('#etisalat_btn_nav').addClass('d-none');
    $('#sidebar-etisalat-btn').addClass('d-none');
    $('#all_transactions_btn_nav').addClass('d-none');
    $('#sidebar-all-transactions-btn').addClass('d-none');
    $('#sidebar-modems-btn').addClass('d-none');
    $('#sidebar-analysis-btn').addClass('d-none');
    $('#sidebar-noip-btn').addClass('d-none');
  }
}

function initUserState() {
  var username = localStorage.getItem('username') || 'Admin';

  $('#display-username').text(username);
  $('#sidebar-username').text(username);

  var avatarLetter = username.charAt(0).toUpperCase();
  $('.user-avatar').text(avatarLetter);
  $('.sidebar-avatar').text(avatarLetter);

  // جلب صلاحية المستخدم من السيرفر (دائماً الأدق)
  fetch('/api/me').then(r => r.json()).then(data => {
    if (data && data.role) {
      localStorage.setItem('userRole', data.role);
      if (data.id) localStorage.setItem('userId', data.id);
      setAdminUI(data.role === 'admin');
    }
  }).catch(() => {
    // fallback على localStorage
    var userRole = localStorage.getItem('userRole');
    var userId = localStorage.getItem('userId');
    setAdminUI(userRole === 'admin' || userId === '1');
  });
}

function syncSidebarWithNav() {
  $(document).on('click', '.navigation ul li.list', function () {
    var url = $(this).find('a').attr('data-full_iframe_target_url');
    $('.menu-item').removeClass('active');
    $('.menu-item[data-full_iframe_target_url="' + url + '"]').addClass('active');
  });
}
