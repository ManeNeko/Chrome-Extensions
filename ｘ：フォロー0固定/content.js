const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    const following = document.querySelector('a[href*="/following"] > span');
    const followers = document.querySelector('a[href*="/verified_followers"] > span');

    if (following && following.textContent !== '0') {
      following.textContent = '0';
    }

    if (followers && followers.textContent !== '0') {
      followers.textContent = '0';
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
