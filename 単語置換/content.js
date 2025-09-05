let observer = null;
// 単語ペアを再帰的に置換
function replaceText(node, pairs) {
    if (!node || pairs.length === 0) return;

    if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentElement && (/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(node.parentElement.nodeName) || node.parentElement.isContentEditable)) {
            return;
        }
        let content = node.textContent;
        for (const pair of pairs) {
            const from = pair.from.replace(/[.*+?^${}()|[\]\\]/g);
            const regex = new RegExp(from, 'g');
            content = content.replace(regex, pair.to);
        }
        node.textContent = content;
    } else {
        for (const child of node.childNodes) {
            replaceText(child, pairs);
        }
    }
}
// ペアを受け取り、置換を実行し、DOMの変更を監視
function runReplacement(pairs) {
    if (pairs.length === 0) return;
    replaceText(document.body, pairs);

    if (!observer) {
        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    replaceText(node, pairs);
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// ストレージから単語ペアを取得し、置換を実行
chrome.storage.sync.get({ wordPairs: [] }, (data) => {
    runReplacement(data.wordPairs || []);
});

// ストレージの変更を監視し、変更があればページをリロード
chrome.storage.onChanged.addListener(() => {
    window.location.reload();
});