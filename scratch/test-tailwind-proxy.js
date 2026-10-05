async function testWithTailwindAllowed() {
  const url = 'https://vaks.com.pk/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  let html = await res.text();
  
  // Inject base tag
  const baseTag = `<base href="${url}">
  <style>
    html, body {
      width: 100% !important;
      min-width: 1280px !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
      pointer-events: none !important;
      user-select: none !important;
    }
    .modal, .cookie-banner, .popup, [class*="cookie"], [class*="popup"], [class*="consent"] {
      display: none !important;
    }
  </style>
  <script>
    window.alert = () => {};
    window.confirm = () => false;
    window.prompt = () => null;
    window.open = () => null;
  </script>`;

  // Convert lazy images
  html = html.replace(/\sdata-src=(["'][^"']+["'])/gi, " src=$1");
  html = html.replace(/\sdata-lazy-src=(["'][^"']+["'])/gi, " src=$1");
  html = html.replace(/\sloading=["']lazy["']/gi, ' loading="eager"');

  // Inject baseTag
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, `$&${baseTag}`);
  } else {
    html = `${baseTag}${html}`;
  }

  console.log('Processed HTML length:', html.length);
  console.log('Contains tailwind script:', html.includes('cdn.tailwindcss.com'));
}

testWithTailwindAllowed();
