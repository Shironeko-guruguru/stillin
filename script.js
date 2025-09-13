function changeScreen(targetId) {
  const current = document.querySelector('.screen.active');
  const next = document.getElementById(targetId);
  const loading = document.getElementById('loading');

  if (current === next) return;

  // ① 外→中心へ黒塗り
  loading.style.opacity = '1';
  loading.style.clipPath = 'circle(150% at 50% 50%)';
  void loading.offsetWidth; // 再描画強制

  loading.style.transition = 'clip-path 1s cubic-bezier(.4,.0,.2,1), opacity 0.3s linear';
  loading.style.clipPath = 'circle(0% at 50% 50%)';

  setTimeout(() => {
    // ② 画面を切り替え
    current.classList.remove('active');
    next.classList.add('active');

    // ③ 中心→外へ透明化（反転アニメ）
    loading.style.clipPath = 'circle(150% at 50% 50%)';
    loading.style.opacity = '0';
  }, 1200); // 塗りつぶし完了後に切り替え
}
