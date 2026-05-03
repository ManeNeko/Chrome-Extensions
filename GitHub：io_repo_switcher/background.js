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
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (!tab?.url) return;

	// URL分解
	const url = new URL(tab.url);
	const host = url.hostname;
	const paths = url.pathname.split('/').filter(Boolean);

	let targetUrl = null;

	// Pages → Repository
	if (host.endsWith('.github.io')) {
		const user = host.split('.')[0];
		const repo = paths[0] || `${user}.github.io`;
		targetUrl = `https://github.com/${user}/${repo}`;
	}

	// Repository → Pages
	else if (host === 'github.com' && paths.length >= 2) {
		const [user, repo] = paths;
		targetUrl = `https://${user}.github.io/${repo === `${user}.github.io` ? '' : repo + '/'}`;
	}

	if (!targetUrl) return;

	// URLの存在確認
	const exists = await fetch(targetUrl, { method: 'HEAD' }).then(r => r.ok).catch(() => false);

	if (exists) {
		chrome.tabs.update(tab.id, { url: targetUrl });
	} else {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: () => alert("ページが存在しません。")
		});
	}
});