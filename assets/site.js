/* zumk.work 공통 스크립트 — 모든 페이지 </body> 직전에 불러옵니다. */
(function () {
    'use strict';
    var Z = window.ZUMK || {};
    var root = document.documentElement;
    var lang = (root.lang || 'ko').indexOf('en') === 0 ? 'en' : 'ko';

    var T = {
        ko: {
            photo: function (i) { return '퍼슈트 촬영 사진 ' + i; },
            viewer: '사진 크게 보기', close: '닫기', prev: '이전 사진', next: '다음 사진',
            menuOpen: '메뉴 열기', menuClose: '메뉴 닫기',
            more: function (n) { return '사진 ' + n + '장 더 보기'; }
        },
        en: {
            photo: function (i) { return 'Fursuit photo ' + i; },
            viewer: 'Photo viewer', close: 'Close', prev: 'Previous photo', next: 'Next photo',
            menuOpen: 'Open menu', menuClose: 'Close menu',
            more: function (n) { return 'Show ' + n + ' more photos'; }
        }
    };
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
                img.className = 'marquee-img rounded-2xl object-cover shadow-lg';
                group.appendChild(img);
            });
            marquee.appendChild(group);
        }
    }

    /* ---------- 갤러리 (매번 랜덤 순서) ---------- */
    var grid = document.getElementById('gallery-grid');
    var galleryList = [];
    var galleryInitial = Z.galleryInitial || 12;
    if (grid && Z.galleryImages) {
        galleryList = Z.galleryImages.slice();
        for (var i = galleryList.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = galleryList[i]; galleryList[i] = galleryList[j]; galleryList[j] = tmp;
        }
        galleryList.forEach(function (name, idx) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gallery-item relative block w-full break-inside-avoid mb-3 md:mb-4 overflow-hidden rounded-2xl cursor-zoom-in bg-neutral-200/70 dark:bg-neutral-800/70';
            btn.setAttribute('aria-label', t.viewer + ': ' + t.photo(idx + 1));
            var img = document.createElement('img');
            img.src = dir + name;
            img.alt = t.photo(idx + 1);
            img.loading = 'lazy';
            img.decoding = 'async';
            img.className = 'w-full h-auto object-cover';
            var markLoaded = function () { img.classList.add('is-loaded'); };
            if (img.complete && img.naturalWidth) markLoaded();
            else { img.addEventListener('load', markLoaded); img.addEventListener('error', markLoaded); }
            btn.appendChild(img);
            var zoom = document.createElement('span');
            zoom.className = 'gallery-zoom';
            zoom.setAttribute('aria-hidden', 'true');
            zoom.innerHTML = '<i class="ri-zoom-in-line"></i>';
            btn.appendChild(zoom);
            btn.addEventListener('click', function () { openLightbox(idx); });
            if (idx >= galleryInitial) btn.classList.add('hidden');
            grid.appendChild(btn);
        });

        // 포트폴리오가 히어로 바로 아래에 있으므로, 처음엔 일부만 보여 주고 나머지는 버튼으로 펼침
        var extra = galleryList.length - galleryInitial;
        if (extra > 0) {
            var moreWrap = document.createElement('div');
            moreWrap.className = 'text-center mt-6';
            var moreBtn = document.createElement('button');
            moreBtn.type = 'button';
            moreBtn.className = 'inline-flex items-center gap-1 px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-white transition';
            moreBtn.innerHTML = '<span></span><i class="ri-arrow-down-s-line"></i>';
            moreBtn.firstChild.textContent = t.more(extra);
            moreBtn.addEventListener('click', function () {
                grid.querySelectorAll('.gallery-item.hidden').forEach(function (el) { el.classList.remove('hidden'); });
                moreWrap.remove();
            });
            moreWrap.appendChild(moreBtn);
            grid.parentNode.insertBefore(moreWrap, grid.nextSibling);
        }
    }

    /* ---------- 스크롤 등장 효과 ---------- */
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if ('IntersectionObserver' in window && !reduceMotion) {
        var revealEls = document.querySelectorAll('section[id]:not(#gallery) > *:not(.max-w-7xl), section[id] > .max-w-7xl > *, #gallery > div > :first-child');
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(function (el) { el.setAttribute('data-reveal', ''); io.observe(el); });
        root.classList.add('reveal-on');
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
