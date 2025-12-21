//ロード処理
document.addEventListener("DOMContentLoaded", () => {

    //ナビゲーション開閉ボタン
    const btnNavToggle = document.querySelector('.btn--nav-toggle');
    const sideNav = document.querySelector('.site-nav-wrapper');
    btnNavToggle.addEventListener('click', () => {
        const status = btnNavToggle.getAttribute('data-status');
        if (status === 'close') {
            sideNav.classList.add('is-open');
            btnNavToggle.setAttribute('data-status', 'open');
            document.body.classList.add('is-nav-open');
        }
        else {
            sideNav.classList.remove('is-open');
            btnNavToggle.setAttribute('data-status', 'close');
            document.body.classList.remove('is-nav-open');
        }
    });
});