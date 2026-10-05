async function checkScripts() {
  const urls = ['https://www.dealex.pk/', 'https://digitalskillshouse.pk/', 'https://vaks.com.pk/'];
  for (const u of urls) {
    const res = await fetch(u);
    const html = await res.text();
    const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>|<script[^>]*>/gi) || [];
    console.log('URL:', u);
    console.log('Script count:', scripts.length);
    console.log('Scripts:', scripts.map(s => s.slice(0, 100)));
    console.log('====================================');
  }
}
checkScripts();
