/* ===========================================================
   zumk.work 공통 설정
   - 모든 페이지 <head>에서 Tailwind CDN 바로 다음에 불러옵니다.
   =========================================================== */

// 1) Tailwind 테마 — brand 색상을 50~900 전체로 정의
//    (기존에는 500/600만 있어서 brand-400, brand-700 클래스가 적용되지 않았음)
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: { sans: ['Pretendard', 'sans-serif'] },
            colors: {
                brand: {
                    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
                    400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
                    800: '#5b21b6', 900: '#4c1d95'
                }
            }
        }
    }
};

// 2) 다크모드 깜빡임 방지 (첫 방문은 라이트 모드)
(function () {
    try {
        if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
    } catch (e) { /* 저장소 접근 불가 시 라이트 모드 유지 */ }
})();

// 3) 사이트 설정
window.ZUMK = {
    // 예약 현황용 Firebase 설정 — ADMIN_SETUP.md 순서대로 채워 주세요.
    // 비어 있으면 사이트는 항상 "예약 가능"으로 표시됩니다.
    firebase: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        appId: ''
    },
    // 관리 페이지에 로그인할 수 있는 구글 계정 (Firestore 보안 규칙에도 같은 주소를 넣어야 함)
    adminEmail: '',

    // 포트폴리오 이미지 목록 — 사진을 추가하려면 파일을 images/에 올리고 여기에 이름만 추가하세요.
    heroImages: [
        'hero1.webp', 'hero2.webp', 'hero3.webp', 'hero4.webp', 'hero5.webp', 'hero6.webp',
        'hero7.webp', 'hero8.webp', 'hero9.webp', 'hero10.webp', 'hero11.webp', 'hero12.webp'
    ],
    galleryImages: [
        'hero1.webp', 'hero2.webp', 'hero3.webp', 'hero4.webp', 'hero5.webp', 'hero6.webp',
        'hero7.webp', 'hero8.webp', 'hero9.webp', 'hero10.webp', 'hero11.webp', 'hero12.webp',
        'work1.webp', 'work2.webp', 'work3.webp', 'work4.webp', 'work5.webp', 'work6.webp',
        'work7.webp', 'work8.webp', 'work9.webp', 'work10.webp', 'work11.webp', 'work12.webp',
        'work13.webp', 'work14.webp', 'work15.webp', 'work16.webp', 'work17.webp'
    ],
    imageDir: 'images/'
};
