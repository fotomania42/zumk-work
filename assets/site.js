/* zumk.work 공통 스크립트 — 모든 페이지 </body> 직전에 불러옵니다. */
(function () {
    'use strict';
    var Z = window.ZUMK || {};
    var root = document.documentElement;
    var lang = (root.lang || 'ko').indexOf('en') === 0 ? 'en' : 'ko';

    var T = {
        ko: {
            loading: '예약 현황 확인 중',
            openShort: '예약 가능', closedShort: '예약 마감',
            openLong: '지금 예약을 받고 있어요',
            closedLong: function (m, n) { return m + '월 예약 마감 · ' + n + '월 1일부터 다시 받아요'; },
            photo: function (i) { return '퍼슈트 촬영 사진 ' + i; },
            viewer: '사진 크게 보기', close: '닫기', prev: '이전 사진', next: '다음 사진',
            menuOpen: '메뉴 열기', menuClose: '메뉴 닫기'
        },
        en: {
            loading: 'Checking availability',
            openShort: 'Booking open', closedShort: 'Fully booked',
            openLong: 'Now taking bookings',
            closedLong: function (m, n) { return 'Fully booked for ' + MONTHS[m - 1] + ' · Reopens ' + MONTHS[n - 1] + ' 1'; },
            photo: function (i) { return 'Fursuit photo ' + i; },
            viewer: 'Photo viewer', close: 'Close', prev: 'Previous photo', next: 'Next photo',
            menuOpen: 'Open menu', menuClose: 'Close menu'
        }
    };
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var t = T[lang];

    /* ---------- 테마 토글 ---------- */
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            root.classList.toggle('dark');
            try { localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light'); } catch (e) {}
        });
    }

    /* ---------- 내비게이션 배경 ---------- */
    var nav = document.getElementById('navbar');
    var menuOpen = false;
    function updateNav() {
        if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 50 || menuOpen);
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    /* ---------- 모바일 메뉴 ---------- */
    var menuBtn = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (menuBtn && menu) {
        var setMenu = function (open) {
            menuOpen = open;
            menu.classList.toggle('hidden', !open);
            menuBtn.setAttribute('aria-expanded', String(open));
            menuBtn.setAttribute('aria-label', open ? t.menuClose : t.menuOpen);
            menuBtn.querySelector('i').className = (open ? 'ri-close-line' : 'ri-menu-line') + ' text-2xl';
            updateNav();
        };
        menuBtn.addEventListener('click', function () { setMenu(!menuOpen); });
        menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
        window.addEventListener('resize', function () { if (window.innerWidth >= 1280 && menuOpen) setMenu(false); });
    }

    /* ---------- 예약 현황 ----------
       Firestore 문서 site/booking = { status: 'open' | 'closed', month: 'YYYY-MM' }
       'closed'는 저장된 달(한국 시간 기준)에만 유효 → 다음 달이 되면 자동으로 '예약 가능' */
    function kstMonth() {
        var parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
        var y = +parts.find(function (p) { return p.type === 'year'; }).value;
        var m = +parts.find(function (p) { return p.type === 'month'; }).value;
        return { y: y, m: m, key: y + '-' + (m < 10 ? '0' + m : m), next: m === 12 ? 1 : m + 1 };
    }
    function resolveBooking(data) {
        var now = kstMonth();
        var closed = !!(data && data.status === 'closed' && data.month === now.key);
        return { closed: closed, month: now.m, next: now.next, key: now.key };
    }
    Z.kstMonth = kstMonth;
    Z.resolveBooking = resolveBooking;

    function renderBadge(el, state, info) {
        var long = el.getAttribute('data-booking-status') === 'long';
        var text;
        if (state === 'loading') text = t.loading;
        else if (state === 'closed') text = long ? t.closedLong(info.month, info.next) : t.closedShort;
        else text = long ? t.openLong : t.openShort;
        el.setAttribute('data-state', state);
        el.innerHTML = '<span class="status-dot" aria-hidden="true"></span><span></span>';
        el.lastChild.textContent = text;
    }

    var badges = document.querySelectorAll('[data-booking-status]');
    if (badges.length) {
        badges.forEach(function (el) { el.setAttribute('role', 'status'); renderBadge(el, 'loading'); });
        var fb = Z.firebase || {};
        var done = function (data) {
            var info = resolveBooking(data);
            badges.forEach(function (el) { renderBadge(el, info.closed ? 'closed' : 'open', info); });
        };
        if (!fb.projectId) {
            done(null);
        } else {
            var url = 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(fb.projectId) +
                '/databases/(default)/documents/site/booking' + (fb.apiKey ? '?key=' + encodeURIComponent(fb.apiKey) : '');
            fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
                var f = (j && j.fields) || {};
                done({
                    status: f.status && f.status.stringValue,
                    month: f.month && f.month.stringValue
                });
            }).catch(function () { done(null); });
        }
    }

    /* ---------- 히어로 무한 스크롤 ---------- */
    var dir = Z.imageDir || 'images/';
    var marquee = document.getElementById('marquee');
    if (marquee && Z.heroImages) {
        for (var g = 0; g < 2; g++) {
            var group = document.createElement('div');
            group.className = 'marquee-group';
            if (g === 1) group.setAttribute('aria-hidden', 'true');
            Z.heroImages.forEach(function (name, i) {
                var img = document.createElement('img');
                img.src = dir + name;
                img.alt = g === 0 ? t.photo(i + 1) : '';
                img.decoding = 'async';
                if (g === 1 || i > 5) img.loading = 'lazy';
                img.className = 'h-48 md:h-64 rounded-xl object-cover shadow-lg border border-white/20 dark:border-neutral-800/50';
                group.appendChild(img);
            });
            marquee.appendChild(group);
        }
    }

    /* ---------- 갤러리 (매번 랜덤 순서) ---------- */
    var grid = document.getElementById('gallery-grid');
    var galleryList = [];
    if (grid && Z.galleryImages) {
        galleryList = Z.galleryImages.slice();
        for (var i = galleryList.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = galleryList[i]; galleryList[i] = galleryList[j]; galleryList[j] = tmp;
        }
        galleryList.forEach(function (name, idx) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'block w-full break-inside-avoid mb-4 overflow-hidden rounded-xl cursor-zoom-in group bg-white/50 dark:bg-neutral-800/50 p-1 border border-white/60 dark:border-neutral-700/50 shadow-sm';
            btn.setAttribute('aria-label', t.viewer + ': ' + t.photo(idx + 1));
            var img = document.createElement('img');
            img.src = dir + name;
            img.alt = t.photo(idx + 1);
            img.loading = 'lazy';
            img.decoding = 'async';
            img.className = 'w-full h-auto rounded-lg object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90';
            btn.appendChild(img);
            btn.addEventListener('click', function () { openLightbox(idx); });
            grid.appendChild(btn);
        });
    }

    /* ---------- 라이트박스 (←/→, ESC, 스와이프) ---------- */
    var lb, lbImg, lbCount, current = 0, lastFocus = null;
    function buildLightbox() {
        lb = document.createElement('div');
        lb.className = 'lb';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.setAttribute('aria-label', t.viewer);
        lb.innerHTML =
            '<button type="button" class="lb-btn lb-close" aria-label="' + t.close + '"><i class="ri-close-line"></i></button>' +
            '<button type="button" class="lb-btn lb-prev" aria-label="' + t.prev + '"><i class="ri-arrow-left-s-line"></i></button>' +
            '<img class="lb-img" alt="">' +
            '<button type="button" class="lb-btn lb-next" aria-label="' + t.next + '"><i class="ri-arrow-right-s-line"></i></button>' +
            '<div class="lb-count" aria-live="polite"></div>';
        document.body.appendChild(lb);
        lbImg = lb.querySelector('.lb-img');
        lbCount = lb.querySelector('.lb-count');
        lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
        lb.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
        lb.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
        lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
        document.addEventListener('keydown', function (e) {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') show(current - 1);
            else if (e.key === 'ArrowRight') show(current + 1);
        });
        var sx = null;
        lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', function (e) {
            if (sx === null) return;
            var dx = e.changedTouches[0].clientX - sx;
            if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
            sx = null;
        });
    }
    function show(i) {
        var n = galleryList.length;
        current = (i + n) % n;
        lbImg.src = dir + galleryList[current];
        lbImg.alt = t.photo(current + 1);
        lbCount.textContent = (current + 1) + ' / ' + n;
    }
    function openLightbox(i) {
        if (!lb) buildLightbox();
        lastFocus = document.activeElement;
        show(i);
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
        lb.querySelector('.lb-close').focus();
    }
    function closeLightbox() {
        lb.classList.remove('open');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }
})();
