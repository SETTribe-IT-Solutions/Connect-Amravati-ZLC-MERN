const setCookie = (name, value, days) => {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires="+d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

export const changeGoogleLanguage = (langCode) => {
  const selectElement = document.querySelector('.goog-te-combo');
  if (selectElement) {
    selectElement.value = langCode;
    selectElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    
    // If it doesn't trigger immediately, use the cookie method as fallback
    setTimeout(() => {
      if (document.documentElement.lang !== langCode && langCode !== 'en') {
        setCookie('googtrans', `/en/${langCode}`, 1);
        window.location.reload();
      } else if (langCode === 'en' && document.cookie.includes('googtrans=')) {
        setCookie('googtrans', '/en/en', -1); // delete cookie
        window.location.reload();
      }
    }, 500);
  } else {
    if (langCode === 'en') {
      setCookie('googtrans', '/en/en', -1);
    } else {
      setCookie('googtrans', `/en/${langCode}`, 1);
    }
    window.location.reload();
  }
};

export const getCurrentLanguage = () => {
  const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
  if (match) return match[1];
  
  const selectElement = document.querySelector('.goog-te-combo');
  return selectElement ? selectElement.value : 'en';
};
