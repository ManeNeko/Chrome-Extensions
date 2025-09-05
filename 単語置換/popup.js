document.addEventListener('DOMContentLoaded', () => {
  const wordPairsList = document.getElementById('word-pairs-list');
  const addForm = document.getElementById('add-form');
  const fromWordInput = document.getElementById('from-word');
  const toWordInput = document.getElementById('to-word');

  let wordPairs = [];

  chrome.storage.sync.get({ wordPairs: [] }, (data) => {
    const sanitizedPairs = (data.wordPairs || [])
      .filter(p => p && typeof p.from === 'string' && typeof p.to === 'string')
      .map(p => ({ from: p.from, to: p.to }));
    
    wordPairs = sanitizedPairs;
    saveAndRender();
  });

  function renderWordPairs() {
    wordPairsList.innerHTML = '';
    wordPairs.forEach((pair, index) => {
      const li = document.createElement('li');
      li.setAttribute('data-index', index);
      li.setAttribute('draggable', true);
      li.innerHTML = `
        <span class="drag-handle">::</span>
        <input type="text" class="from-word-edit" value="${escapeHTML(pair.from)}" data-index="${index}">
        <input type="text" class="to-word-edit" value="${escapeHTML(pair.to)}" data-index="${index}">
        <button class="delete-btn" data-index="${index}">削除</button>
      `;
      wordPairsList.appendChild(li);
    });
  }

  function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  }

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const from = fromWordInput.value.trim();
    const to = toWordInput.value.trim();
    if (from && to) {
      const isDuplicate = wordPairs.some(pair => pair.from === from && pair.to === to);
      if (isDuplicate) {
        alert('「' + from + '」から「' + to + '」へのペアは既に追加されています。');
        return;
      }
      wordPairs.push({ from, to });
      saveAndRender();
      fromWordInput.value = '';
      toWordInput.value = '';
    }
  });

  wordPairsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const index = parseInt(e.target.dataset.index, 10);
      wordPairs.splice(index, 1);
      saveAndRender();
    }
  });

  wordPairsList.addEventListener('change', (e) => {
    if (e.target.classList.contains('from-word-edit') || e.target.classList.contains('to-word-edit')) {
      const index = parseInt(e.target.dataset.index, 10);
      const fromInput = wordPairsList.querySelector(`.from-word-edit[data-index="${index}"]`);
      const toInput = wordPairsList.querySelector(`.to-word-edit[data-index="${index}"]`);
      const newFrom = fromInput.value.trim();
      const newTo = toInput.value.trim();
      if (newFrom && newTo) {
        const isDuplicate = wordPairs.some((pair, i) => i !== index && pair.from === newFrom && pair.to === newTo);
        if (isDuplicate) {
          alert('「' + newFrom + '」から「' + newTo + '」へのペアは既に登録されています。');
          fromInput.value = wordPairs[index].from;
          toInput.value = wordPairs[index].to;
          return;
        }
        wordPairs[index] = { from: newFrom, to: newTo };
        saveAndRender();
      } else {
        alert('単語を空にすることはできません。');
        fromInput.value = wordPairs[index].from;
        toInput.value = wordPairs[index].to;
      }
    }
  });

  let dragStartIndex;

  wordPairsList.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'LI') {
      dragStartIndex = parseInt(e.target.dataset.index, 10);
      e.target.classList.add('dragging');
    }
  });

  wordPairsList.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  wordPairsList.addEventListener('drop', (e) => {
    e.preventDefault();
    const dropTarget = e.target.closest('li');
    if (!dropTarget || dropTarget.dataset.index == dragStartIndex) return;

    const dropIndex = parseInt(dropTarget.dataset.index, 10);

    const draggedItem = wordPairs.splice(dragStartIndex, 1)[0];
    wordPairs.splice(dropIndex, 0, draggedItem);

    saveAndRender();
  });

  wordPairsList.addEventListener('dragend', (e) => {
    const draggingElement = wordPairsList.querySelector('.dragging');
    if(draggingElement) {
        draggingElement.classList.remove('dragging');
    }
  });

  function saveAndRender() {
    chrome.storage.sync.set({ wordPairs }, () => {
      renderWordPairs();
    });
  }
});