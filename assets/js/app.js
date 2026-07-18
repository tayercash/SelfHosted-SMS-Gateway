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
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.add('open');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      sidebar.classList.remove('open');
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', function () {
      sidebar.classList.remove('open');
    });
  }

  $(document).on('click', '[data-full_iframe_target_url]', function (e) {
    e.preventDefault();
    var target = $(this).data('full_iframe_target_url');
    sidebar.classList.remove('open');

    $('.menu-item').removeClass('active');
    $(this).addClass('active');

    if (window.loadPage) {
      window.loadPage(target);
    }
  });
}

function setAdminUI(isAdmin) {
  if (isAdmin) {
    $('#admin_btn_nav').removeClass('d-none');
    $('#sidebar-admin-btn').removeClass('d-none');
    $('#etisalat_btn_nav').removeClass('d-none');
    $('#sidebar-etisalat-btn').removeClass('d-none');
    $('#modems_btn_nav').removeClass('d-none');
    $('#sidebar-modems-btn').removeClass('d-none');
    $('#all_transactions_btn_nav').removeClass('d-none');
    $('#sidebar-all-transactions-btn').removeClass('d-none');
    $('#sidebar-analysis-btn').removeClass('d-none');
    $('#sidebar-noip-btn').removeClass('d-none');
  } else {
    $('#modems_btn_nav').addClass('d-none');
    $('#sidebar-modems-btn').addClass('d-none');
    $('#admin_btn_nav').addClass('d-none');
    $('#sidebar-admin-btn').addClass('d-none');
    $('#etisalat_btn_nav').addClass('d-none');
    $('#sidebar-etisalat-btn').addClass('d-none');
    $('#all_transactions_btn_nav').addClass('d-none');
    $('#sidebar-all-transactions-btn').addClass('d-none');
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
