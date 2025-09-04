const newWordInput = document.getElementById('new-word-input');
const addWordBtn = document.getElementById('add-word-btn');
const wordListContainer = document.getElementById('word-list');
const toggleBtn = document.getElementById('toggle-list-btn');
const listArea = document.getElementById('word-list-area');

let blockwords = []; // 単語リストを保持する配列

// 表示/非表示ボタンの更新
const updateToggleBtnText = () => {
  if (window.getComputedStyle(listArea).display === 'none') {
    toggleBtn.textContent = 'ブロック中の単語を表示';
  } else {
    toggleBtn.textContent = '非表示';
  }
};

// 単語リストをストレージに保存
const saveWords = async () => {
  try {
    await chrome.storage.sync.set({ blockwords: blockwords });
  } catch (error) {
    console.error('設定の保存に失敗:', error);
  }
};

// 単語リストを画面にレンダリング
const renderWords = () => {
  wordListContainer.innerHTML = '';
  blockwords.forEach(word => {
    const tag = document.createElement('div');
    tag.className = 'word-tag';
    const text = document.createElement('span');
    text.textContent = word;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => removeWord(word));
    tag.appendChild(text);
    tag.appendChild(removeBtn);
    wordListContainer.appendChild(tag);
  });
};

// 単語をリストから削除
const removeWord = (wordToRemove) => {
  blockwords = blockwords.filter(word => word !== wordToRemove);
  saveWords();
  renderWords();
};

// 新規単語をリストに追加
const addWord = () => {
  const newWord = newWordInput.value.trim();
  if (newWord && !blockwords.includes(newWord)) {
    blockwords.push(newWord);
    blockwords.sort();
    saveWords();
    renderWords();
    newWordInput.value = '';
  }
};

// 初期化処理
const initialize = async () => {
  const items = await chrome.storage.sync.get({ blockwords: [] });
  let data = items.blockwords;

  if (typeof data === 'string') {
    data = data.split('\n').map(w => w.trim()).filter(w => w.length > 0);
  }

  blockwords = Array.isArray(data) ? data : [];
  blockwords.sort();
  
  renderWords();
  updateToggleBtnText();

  // イベントリスナー
  addWordBtn.addEventListener('click', addWord);
  newWordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addWord();
    }
  });

  toggleBtn.addEventListener('click', () => {
    const isHidden = window.getComputedStyle(listArea).display === 'none';
    listArea.style.display = isHidden ? 'block' : 'none';
    updateToggleBtnText();
  });
};

document.addEventListener('DOMContentLoaded', initialize);