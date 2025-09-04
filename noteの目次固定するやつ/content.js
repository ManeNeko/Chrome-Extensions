// スクロールスパイの実装
window.addEventListener('scroll', () => {
  // 1. 見出しと目次要素の取得
  const headings = document.querySelectorAll('h2[id], h3[id]');
  const tocLinks = document.querySelectorAll('.o-tableOfContents__link');
  // ハイライトの基準となる画面上部からのオフセット（ピクセル単位）
  const offset = -400; 

  if (headings.length === 0 || tocLinks.length === 0) {
    return;
  }

  let activeIndex = -1;

  // 2. 現在のスクロール位置を基に、どの項目を見てるか判定
  headings.forEach((heading, index) => {
    const rect = heading.getBoundingClientRect();
    if (rect.top < offset) {
      activeIndex = index;
    }
  });

  // 3. ハイライト処理：判定された目次リンクに 'active' クラスを付与
  tocLinks.forEach((link, index) => {
    if (index === activeIndex) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});