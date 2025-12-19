//ロード処理
document.addEventListener("DOMContentLoaded", () => {

    //ナビゲーション開閉ボタン
    const btnNavToggle = document.querySelector('.btn--nav-toggle');
    const sideNav = document.querySelector('.site-nav-wrapper');
    const toggleOpenIcon = btnNavToggle.querySelector('.toggle-open-icon');
    const toggleCloseIcon = btnNavToggle.querySelector('.toggle-close-icon');

    btnNavToggle.addEventListener('click', () => {
        const status = btnNavToggle.getAttribute('data-status');
        if (status === 'close') {
            sideNav.classList.add('is-open');
            btnNavToggle.setAttribute('data-status', 'open');
            toggleOpenIcon.classList.add('is-hidden');
            toggleCloseIcon.classList.remove('is-hidden');
            document.body.classList.add('is-nav-open');
        }
        else {
            sideNav.classList.remove('is-open');
            btnNavToggle.setAttribute('data-status', 'close');
            toggleOpenIcon.classList.remove('is-hidden');
            toggleCloseIcon.classList.add('is-hidden');
            document.body.classList.remove('is-nav-open');
        }
    });
});