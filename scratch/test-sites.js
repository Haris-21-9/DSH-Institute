const urls = ['https://www.dealex.pk/', 'https://digitalskillshouse.pk/', 'https://vaks.com.pk/'];

async function run() {
  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      const html = await res.text();
      console.log('URL:', u);
      console.log('  Status:', res.status);
      console.log('  HTML Length:', html.length);
      console.log('  Has <head>:', html.includes('<head'));
      console.log('  Has <body>:', html.includes('<body'));
      console.log('  Title:', (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || 'None');
      console.log('  X-Frame-Options:', res.headers.get('x-frame-options'));
      console.log('  CSP:', res.headers.get('content-security-policy'));
      console.log('-----------------------------------------');
    } catch (e) {
      console.error('URL Error:', u, e.message);
    }
  }
}

run();
