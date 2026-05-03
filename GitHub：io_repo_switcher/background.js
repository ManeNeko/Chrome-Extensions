// 拡張機能インストール時に実行
chrome.runtime.onInstalled.addListener(() => {
	// 右クリックメニューを作成
	chrome.contextMenus.create({
		id: "switch",
		title: "GitHub ⇔ Pages",
		contexts: ["page"]
	});
});

// メイン処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (!tab?.url) return;

	// URL分解
	const url = new URL(tab.url);
	const host = url.hostname;
	const paths = url.pathname.split('/').filter(Boolean);

	// Pages → Repository
	if (host.endsWith('.github.io')) {
		const user = host.split('.')[0];
		const repo = paths[0] || `${user}.github.io`;
		chrome.tabs.update(tab.id, { url: `https://github.com/${user}/${repo}` });
	}

	// Repository → Pages
	else if (host === 'github.com' && paths.length >= 2) {
		const user = paths[0];
		const repo = paths[1];
		chrome.tabs.update(tab.id, {
			url: `https://${user}.github.io/${repo === `${user}.github.io` ? '' : repo + '/'}`
		});
	}
});