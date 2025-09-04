// --- 定数定義 ---
const TARGET_ELEMENT_SELECTOR = '#ranking_table > tbody > tr';
const STYLE_ID = 'content-filter-style';

// --- 初期化処理: ページの描画前に実行 ---
const styleElement = document.createElement('style');
styleElement.id = STYLE_ID;
styleElement.textContent = `${TARGET_ELEMENT_SELECTOR} { display: none !important; }`;
(document.head || document.documentElement).appendChild(styleElement);

// --- グローバル変数 ---
let blockwords = [];

// --- 関数定義 ---
// ブロック単語リストをストレージから読み込む
const loadBlockwords = async () => {
  try {
    const items = await chrome.storage.sync.get({ blockwords: [] });
    let data = items.blockwords;

    blockwords = (Array.isArray(data) ? data : [])
      .map(word => word.trim())
      .filter(word => word.length > 0);

  } catch (error) {
    console.error('[Content Filter] ブロック単語の読み込みに失敗:', error);
  }
};

// コンテンツをフィルタリングする
const filterContent = () => {
  const productElements = document.querySelectorAll(TARGET_ELEMENT_SELECTOR);
  if (productElements.length === 0) {
    return;
  }

  productElements.forEach(element => {
    const elementText = element.textContent || '';
    const shouldBeBlocked = blockwords.some(word => elementText.includes(word));

    if (shouldBeBlocked) {
      element.style.setProperty('display', 'none', 'important');
    } else {
      element.style.setProperty('display', 'table-row', 'important');
    }
  });
};

// DOM変化を監視してフィルタを再適用
const startObserver = () => {
  const observer = new MutationObserver(() => {
    filterContent();
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

// メイン処理
const main = async () => {
  await loadBlockwords();
  
  document.addEventListener('DOMContentLoaded', () => {
    filterContent();
    startObserver();
  });

  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'sync' && changes.blockwords) {
      console.log('[Content Filter] 設定が変更されました。フィルタを再適用します。');
      await loadBlockwords();
      filterContent();
    }
  });
};

// --- 実行 ---
main();