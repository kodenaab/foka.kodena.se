(async () => {
  const repository = 'kodenaab/foka.kodena.se';
  const status = document.getElementById('release-status');
  const swedish = document.documentElement.lang === 'sv';
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(8000)
    });
    if (response.status === 404) {
      status.textContent = swedish
        ? 'Publika nedladdningar förbereds. Paketen visas här när den första releasen har publicerats.'
        : 'Public downloads are being prepared. Packages will appear here when the first release is published.';
      return;
    }
    if (!response.ok) return; // Keep the ordinary Releases links as a fallback.
    const release = await response.json();
    if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name)) return;
    const version = release.tag_name.slice(1);
    const names = { mac: `Foka-${version}-osx-arm64.dmg`, windows: `Foka-${version}-win-x64.zip` };
    const prefix = `https://github.com/${repository}/releases/download/${release.tag_name}/`;
    for (const link of document.querySelectorAll('[data-download]')) {
      const asset = release.assets.find(a => a.name === names[link.dataset.download]);
      if (!asset || asset.browser_download_url !== prefix + asset.name) continue;
      link.href = asset.browser_download_url;
      link.closest('article').querySelector('small').textContent = `Version ${version} · ${link.dataset.download === 'mac' ? 'DMG' : 'ZIP'} · ${swedish ? 'Testversion' : 'Evaluation build'}`;
    }
  } catch {
    // Network failures never prevent the static website or demo from working.
  }
})();
