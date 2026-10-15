// Deep link: museum.html#gallery skips the museum's own entrance screen and opens the gallery hall.
if (location.hash === '#gallery') {
  const selector = '.hero-content .explore-button';
  const open = () => {
    const button = document.querySelector(selector);
    if (!button) return false;
    button.click();
    history.replaceState(null, '', location.pathname + location.search);
    return true;
  };
  if (!open()) {
    const observer = new MutationObserver(() => { if (open()) observer.disconnect(); });
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 8000);
  }
}
